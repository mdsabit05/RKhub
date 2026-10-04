import { Hono } from "hono";
import OpenAI from "openai";
import { query } from "../db.js";

const askRouter = new Hono();

const SYSTEM_PROMPT = `You are an academic resource finder for RKhub, a college system in India.
Parse the student's request and return ONLY a JSON object — no explanation, no markdown.

Fields to extract:
- type: "notes" | "pyq" | "syllabus" | "reference"
- year: 1 | 2 | 3  (1st / 2nd / 3rd year)
- course: "BCA" | "BBA"
- semester: 1-6  (year 1 → sem 1,2 | year 2 → sem 3,4 | year 3 → sem 5,6)
- subjectKeyword: subject name or code the student mentioned (e.g. "DBMS", "Mathematics", "CC-202")
- unitNo: 1 | 2 | 3 | 4  (only for notes or reference, if mentioned)

Omit any field you cannot determine from the request.

Examples:
- "BCA 2nd year DBMS unit 1 notes" → {"type":"notes","year":2,"course":"BCA","semester":3,"subjectKeyword":"DBMS","unitNo":1}
- "BBA semester 5 syllabus" → {"type":"syllabus","year":3,"course":"BBA","semester":5}
- "previous year question paper for Mathematics" → {"type":"pyq","subjectKeyword":"Mathematics"}
- "reference material for CC-202 unit 2" → {"type":"reference","subjectKeyword":"CC-202","unitNo":2}`;

interface Intent {
  type?: string;
  year?: number;
  course?: string;
  semester?: number;
  subjectKeyword?: string;
  unitNo?: number;
}

function makeClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not configured on the server.");

  return new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
}

async function parseIntent(prompt: string): Promise<Intent> {
  const client = makeClient();

  const completion = await client.chat.completions.create({
    model: "nvidia/nemotron-3-super-120b-a12b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    top_p: 1,
    max_tokens: 200,
    stream: false,
  });

  const content = completion.choices[0]?.message?.content ?? "";

  // Extract JSON even if the model wraps it in extra text
  const match = content.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error("AI returned an unexpected response. Try rephrasing your request.");

  return JSON.parse(match[0]) as Intent;
}

askRouter.post("/", async (c) => {
  let body: { prompt?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const prompt = body.prompt?.trim();
  if (!prompt) return c.json({ error: "prompt is required" }, 400);

  let intent: Intent;
  try {
    intent = await parseIntent(prompt);
  } catch (err: any) {
    return c.json({ error: err.message ?? "Failed to process your request." }, 502);
  }

  const { type, year, course, semester, subjectKeyword, unitNo } = intent;

  // Tell the user exactly what's missing
  const missing: string[] = [];
  if (!type) missing.push("resource type (notes / pyq / syllabus / reference)");
  if (!year) missing.push("year (1st / 2nd / 3rd)");
  if (!course) missing.push("course (BCA / BBA)");
  if (!semester) missing.push("semester number");
  if (!subjectKeyword) missing.push("subject name");

  if (missing.length) {
    return c.json({
      partial: true,
      intent,
      message: `I understood part of your request but need: ${missing.join(", ")}.`,
      hint: 'Try: "BCA 2nd year semester 3 DBMS unit 1 notes"',
    });
  }

  // Fuzzy subject lookup — matches on name or code
  const subjects = await query(
    `SELECT s.id, s.code, s.name
     FROM subjects s
     JOIN courses c ON c.id = s.course_id
     WHERE s.year_no = $1
       AND c.code = $2
       AND s.semester_no = $3
       AND (s.name ILIKE $4 OR s.code ILIKE $4)
     ORDER BY s.display_order
     LIMIT 1`,
    [year, course, semester, `%${subjectKeyword}%`]
  );

  if (!subjects.length) {
    return c.json({
      notFound: true,
      intent,
      message: `No subject matching "${subjectKeyword}" found for ${course} Year ${year} Semester ${semester}.`,
      hint: "Check the subject name or browse manually.",
    });
  }

  const subject = subjects[0] as { id: number; code: string; name: string };

  const params: unknown[] = [type, year, course, semester, subject.code];
  let sql = `
    SELECT r.id, r.title, r.description,
           r.file_url AS "fileUrl",
           r.external_url AS "externalUrl",
           s.code AS "subjectCode",
           s.name AS "subjectName",
           u.unit_no AS "unitNo",
           u.name AS "unitName"
    FROM resources r
    JOIN subjects s ON s.id = r.subject_id
    JOIN courses c ON c.id = s.course_id
    LEFT JOIN units u ON u.id = r.unit_id
    WHERE r.resource_type = $1
      AND r.year_no = $2
      AND c.code = $3
      AND r.semester_no = $4
      AND s.code = $5
  `;

  if (unitNo) {
    params.push(unitNo);
    sql += ` AND u.unit_no = $${params.length}`;
  }

  sql += " ORDER BY r.title LIMIT 1";

  const rows = await query(sql, params);

  if (!rows.length) {
    const typeLabel = type === "pyq" ? "PYQ" : type;
    return c.json({
      notFound: true,
      intent,
      subject,
      message: `No ${typeLabel} found for ${subject.name}${unitNo ? ` Unit ${unitNo}` : ""}.`,
      hint: "The resource may not have been uploaded yet.",
    });
  }

  return c.json({ resource: rows[0], subject, intent });
});

export default askRouter;
