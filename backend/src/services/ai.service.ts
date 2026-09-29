import { query } from "../db.js";

export type AcademicIntent =
  | "FIND_NOTES"
  | "FIND_PYQ"
  | "FIND_SYLLABUS"
  | "FIND_REFERENCE"
  | "PREDICT_QUESTION_PAPER"
  | "GENERAL_ACADEMIC_QUERY";

export type AcademicContext = {
  year?: number | null;
  course?: string | null;
  semester?: number | null;
  subjectId?: number | null;
  attachmentName?: string | null;
  attachmentText?: string | null;
};

const YEAR_PATTERNS: Array<{ regex: RegExp; year: number }> = [
  { regex: /\b(1st|first|1)\s*(year|yr)\b/i, year: 1 },
  { regex: /\b(2nd|second|2)\s*(year|yr)\b/i, year: 2 },
  { regex: /\b(3rd|third|3|final)\s*(year|yr)\b/i, year: 3 },
  { regex: /\byear\s*[- ]?\s*1\b/i, year: 1 },
  { regex: /\byear\s*[- ]?\s*2\b/i, year: 2 },
  { regex: /\byear\s*[- ]?\s*3\b/i, year: 3 },
];

const SEMESTER_PATTERNS: Array<{ regex: RegExp; semester: number }> = [
  { regex: /\b(1st|first|1)\s*(sem|semester)\b/i, semester: 1 },
  { regex: /\b(2nd|second|2)\s*(sem|semester)\b/i, semester: 2 },
  { regex: /\b(3rd|third|3)\s*(sem|semester)\b/i, semester: 3 },
  { regex: /\b(4th|fourth|4)\s*(sem|semester)\b/i, semester: 4 },
  { regex: /\b(5th|fifth|5)\s*(sem|semester)\b/i, semester: 5 },
  { regex: /\b(6th|sixth|6)\s*(sem|semester)\b/i, semester: 6 },
  { regex: /\bsem(ester)?\s*[- ]?\s*1\b/i, semester: 1 },
  { regex: /\bsem(ester)?\s*[- ]?\s*2\b/i, semester: 2 },
  { regex: /\bsem(ester)?\s*[- ]?\s*3\b/i, semester: 3 },
  { regex: /\bsem(ester)?\s*[- ]?\s*4\b/i, semester: 4 },
  { regex: /\bsem(ester)?\s*[- ]?\s*5\b/i, semester: 5 },
  { regex: /\bsem(ester)?\s*[- ]?\s*6\b/i, semester: 6 },
];

const COURSE_PATTERNS: Array<{ regex: RegExp; course: string }> = [
  { regex: /\b(bca|bachelor of computer applications)\b/i, course: "BCA" },
  { regex: /\b(bba|bachelor of business administration)\b/i, course: "BBA" },
];

const SUBJECT_SEARCH_TARGETS: Array<{ patterns: RegExp[]; searchTerms: string[] }> = [
  {
    patterns: [/\bdbms\b/i, /\bdata\s*base\b/i, /\bdatabase\b/i],
    searchTerms: ["%data base management%", "%database management%", "%dbms%"],
  },
  {
    patterns: [/\b(os|operating\s*systems?)\b/i],
    searchTerms: ["%operating system%"],
  },
  {
    patterns: [/\b(cn|computer\s*networks?|networking)\b/i],
    searchTerms: ["%computer network%"],
  },
  {
    patterns: [/\b(ds|data\s*structures?)\b/i],
    searchTerms: ["%data structure%"],
  },
  {
    patterns: [/\b(daa|algorithms?|analysis\s*of\s*algorithm)\b/i],
    searchTerms: ["%algorithm%"],
  },
  {
    patterns: [/\b(ai|artificial\s*intelligence)\b/i],
    searchTerms: ["%artificial intelligence%"],
  },
  {
    patterns: [/\b(genai|gen\s*ai|generative\s*ai)\b/i],
    searchTerms: ["%generative ai%"],
  },
  {
    patterns: [/\b(python)\b/i],
    searchTerms: ["%python%"],
  },
  {
    patterns: [/\b(java|oops?)\b/i],
    searchTerms: ["%java%"],
  },
  {
    patterns: [/\b(se|software\s*engineering)\b/i],
    searchTerms: ["%software engineering%"],
  },
  {
    patterns: [/\b(prob|probability|stats|statistics)\b/i],
    searchTerms: ["%probability%"],
  },
  {
    patterns: [/\b(web\s*tech|web\s*technolog(?:y|ies))\b/i],
    searchTerms: ["%web technolog%"],
  },
  {
    patterns: [/\b(ca|coa|computer\s*architecture)\b/i],
    searchTerms: ["%computer architecture%"],
  },
  {
    patterns: [/\b(math|maths|mathematics)\b/i],
    searchTerms: ["%mathematics%"],
  },
  {
    patterns: [/\b(ppm|principles\s*of\s*management)\b/i],
    searchTerms: ["%principles and practices%"],
  },
  {
    patterns: [/\b(fa|financial\s*accounting)\b/i],
    searchTerms: ["%financial accounting%"],
  },
  {
    patterns: [/\b(hrm|human\s*resource)\b/i],
    searchTerms: ["%human resource%"],
  },
  {
    patterns: [/\b(marketing)\b/i],
    searchTerms: ["%marketing%"],
  },
  {
    patterns: [/\b(economics)\b/i],
    searchTerms: ["%economics%"],
  },
];

function normalize(text: string): string {
  return String(text ?? "").trim().toLowerCase();
}

function detectIntent(text: string): AcademicIntent {
  const lower = normalize(text);
  if (/predict|upcoming|probable|guess|expected.*exam|question paper|exam questions|sample.*paper/.test(lower)) {
    return "PREDICT_QUESTION_PAPER";
  }
  if (/syllabus|curriculum|course plan|topics|outline/.test(lower)) {
    return "FIND_SYLLABUS";
  }
  if (/reference|reference material|book|books|reading|links|material/.test(lower)) {
    return "FIND_REFERENCE";
  }
  if (/pyq|previous year|previous-year|question paper|past paper|old paper|solved paper/.test(lower)) {
    return "FIND_PYQ";
  }
  if (/note|notes|unit [0-9]|study material|study notes|lecture notes|module/.test(lower)) {
    return "FIND_NOTES";
  }
  return "GENERAL_ACADEMIC_QUERY";
}

function extractUnitNumber(text: string): number | null {
  const unitMatch = text.match(/\b(?:unit|module|u)\s*[- ]?\s*([1-4])\b/i);
  if (!unitMatch) return null;
  return Number(unitMatch[1]);
}

function extractYear(text: string): number | null {
  for (const { regex, year } of YEAR_PATTERNS) {
    if (regex.test(text)) return year;
  }
  return null;
}

function extractSemester(text: string): number | null {
  for (const { regex, semester } of SEMESTER_PATTERNS) {
    if (regex.test(text)) return semester;
  }
  return null;
}

function extractCourse(text: string): string | null {
  for (const { regex, course } of COURSE_PATTERNS) {
    if (regex.test(text)) return course;
  }
  return null;
}

function extractSubjectCode(text: string): string | null {
  const match = text.match(/\b([a-zA-Z]{2,3})\s*[- ]?\s*(\d{3})\b/);
  if (match) {
    return `${match[1].toUpperCase()}-${match[2]}`;
  }
  return null;
}

async function findSubjectByName(
  rawText: string,
  course?: string | null,
  year?: number | null,
  semester?: number | null
) {
  const code = extractSubjectCode(rawText);
  if (code) {
    const codeRows = await query(
      `SELECT s.id, s.code, s.name, s.year_no AS "yearNo", s.semester_no AS "semesterNo",
              c.code AS "courseCode", c.name AS "courseName"
       FROM subjects s
       JOIN courses c ON c.id = s.course_id
       WHERE REPLACE(LOWER(s.code), '-', '') = REPLACE(LOWER($1), '-', '')
       LIMIT 1`,
      [code]
    );
    if (codeRows[0]) return codeRows[0];
  }

  const lower = normalize(rawText);

  // Check known aliases to find matching search terms
  const matchedTerms: string[] = [];
  for (const target of SUBJECT_SEARCH_TARGETS) {
    for (const pattern of target.patterns) {
      if (pattern.test(lower)) {
        matchedTerms.push(...target.searchTerms);
        break;
      }
    }
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (matchedTerms.length > 0) {
    const uniqueTerms = Array.from(new Set(matchedTerms));
    const orClauses = uniqueTerms.map((kw) => {
      params.push(kw.toLowerCase());
      return `LOWER(s.name) LIKE $${params.length}`;
    });
    conditions.push(`(${orClauses.join(" OR ")})`);
  } else {
    // Clean text of common noise words
    const cleanSearch = lower
      .replace(/\b(give|me|find|show|i|want|need|get|for|the|notes|pyq|syllabus|reference|material|predict|questions|question|paper|bca|bba|1st|2nd|3rd|year|semester|sem|unit|\d)\b/gi, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .trim();

    if (cleanSearch.length >= 2) {
      params.push(`%${cleanSearch}%`);
      conditions.push(`(LOWER(s.name) LIKE $${params.length} OR LOWER(s.code) LIKE $${params.length})`);
    } else {
      return null;
    }
  }

  if (course) {
    params.push(course);
    conditions.push(`LOWER(c.code) = LOWER($${params.length})`);
  }

  if (year) {
    params.push(Number(year));
    conditions.push(`s.year_no = $${params.length}`);
  }

  if (semester) {
    params.push(Number(semester));
    conditions.push(`s.semester_no = $${params.length}`);
  }

  const sql = `
    SELECT s.id, s.code, s.name, s.year_no AS "yearNo", s.semester_no AS "semesterNo",
           c.code AS "courseCode", c.name AS "courseName"
    FROM subjects s
    JOIN courses c ON c.id = s.course_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY s.display_order, s.code
    LIMIT 1
  `;

  const rows = await query(sql, params);
  return rows[0] ?? null;
}

const TYPE_BY_INTENT: Record<AcademicIntent, string> = {
  FIND_NOTES: "notes",
  FIND_PYQ: "pyq",
  FIND_SYLLABUS: "syllabus",
  FIND_REFERENCE: "reference",
  PREDICT_QUESTION_PAPER: "pyq",
  GENERAL_ACADEMIC_QUERY: "",
};

/**
 * Call configured LLM provider (NVIDIA NIM / OpenAI-compatible or Google Gemini) using native fetch.
 * Returns null if no API key is configured or on failure, so fallback kicks in seamlessly.
 */
async function callLlm(prompt: string, systemInstruction?: string): Promise<string | null> {
  const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  const aiBaseUrl = (process.env.AI_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const aiModel = process.env.AI_MODEL || "nvidia/nemotron-3-super-120b-a12b";
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // Temporarily ensure TLS connections succeed in environments with self-signed/proxy intercepting certificates
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (!prevTls && process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  try {
    // 1. If OpenAI / NVIDIA NIM API key is configured
    if (aiApiKey) {
      const messages: Array<{ role: string; content: string }> = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch(`${aiBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: aiModel,
          messages,
          temperature: 0.5,
          max_tokens: 1024,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) return String(content).trim();
      } else {
        console.warn(`[AI API] Request failed with status ${response.status}: ${await response.text()}`);
      }
    }

    // 2. If Gemini API key is configured
    if (geminiApiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
      const payload: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) return String(replyText).trim();
      } else {
        console.warn(`[Gemini API] Request failed with status ${response.status}: ${await response.text()}`);
      }
    }

    return null;
  } catch (error: any) {
    console.warn(`[AI Service] Error contacting LLM provider:`, error?.message || error);
    return null;
  } finally {
    if (!prevTls && process.env.NODE_ENV !== "production") {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }
  }
}

export async function handleAcademicChat(message: string, context: AcademicContext = {}) {
  const rawText = String(message ?? "").trim();
  if (!rawText && !context.attachmentName && !context.attachmentText) {
    return {
      message: "Type your academic question or what resource you need.",
      intent: "GENERAL_ACADEMIC_QUERY",
      found: false,
    };
  }

  // Combine query text with attachment name to extract course/subject/unit clues
  const textToScan = context.attachmentName
    ? `${rawText} ${context.attachmentName.replace(/[._-]/g, " ")}`
    : rawText;

  const intent = detectIntent(textToScan);
  const unitNo = extractUnitNumber(textToScan);
  const detectedYear = extractYear(textToScan);
  const detectedSem = extractSemester(textToScan);
  const detectedCourse = extractCourse(textToScan);

  let year = context.year ?? detectedYear;
  let course = context.course ? String(context.course).toUpperCase() : detectedCourse;
  let semester = context.semester ?? detectedSem;

  let subject: any = null;

  if (context.subjectId) {
    const rows = await query(
      `SELECT s.id, s.code, s.name, s.year_no AS "yearNo", s.semester_no AS "semesterNo",
              c.code AS "courseCode", c.name AS "courseName"
       FROM subjects s
       JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1`,
      [Number(context.subjectId)]
    );
    subject = rows[0] ?? null;
  }

  if (!subject) {
    subject = await findSubjectByName(textToScan, course, year, semester);
  }

  // If still not found and no course/year was specified, search without constraints
  if (!subject && (course || year || semester)) {
    subject = await findSubjectByName(textToScan);
  }

  // Populate inferred year/course/semester from resolved subject
  if (subject) {
    year = year ?? subject.yearNo;
    course = course ?? subject.courseCode;
    semester = semester ?? subject.semesterNo;
  }

  // Handle Question Paper Prediction
  if (intent === "PREDICT_QUESTION_PAPER") {
    const predictedSubject = subject;
    if (!predictedSubject) {
      return {
        message: "Please mention the subject name or code for the exam prediction (e.g. DBMS, Operating Systems, or BCA 2nd year).",
        intent,
        found: false,
      };
    }

    // Fetch units and past PYQs from PostgreSQL
    const units = await query(
      `SELECT unit_no AS "unitNo", name FROM units WHERE subject_id = $1 ORDER BY unit_no`,
      [predictedSubject.id]
    );

    const pyqs = await query(
      `SELECT r.id, r.title, r.file_url AS "fileUrl", u.unit_no AS "unitNo"
       FROM resources r
       LEFT JOIN units u ON u.id = r.unit_id
       WHERE r.resource_type = 'pyq' AND r.subject_id = $1
       ORDER BY r.id DESC LIMIT 10`,
      [predictedSubject.id]
    );

    // Call LLM (NVIDIA / OpenAI / Gemini) for smart exam paper prediction if available
    let aiExamAnalysis: string | null = null;
    const unitsList = units.map((u: any) => `Unit ${u.unitNo}: ${u.name}`).join(", ");
    const pyqList = pyqs.map((p: any) => p.title).join("; ");
    const prompt = `As an expert college professor, generate a predicted high-probability question paper for ${predictedSubject.name} (${predictedSubject.code}) for college students.
Curriculum units: ${unitsList}.
Available past question references: ${pyqList || "Standard university syllabus"}.
Format as:
1. Part A (Short 2-3 mark questions)
2. Part B (Comprehensive 5-10 mark questions)
3. High Probability Exam Tips`;

    aiExamAnalysis = await callLlm(
      prompt,
      "You are an academic expert assistant for RKhub, an academic college portal. Provide clear, accurate exam questions aligned with the syllabus."
    );

    const defaultQuestions = pyqs.length > 0
      ? pyqs.map((entry: any, index: number) => `${index + 1}. ${entry.title || `${predictedSubject.name} past question paper topic`}`)
      : [
          `1. Explain the architectural concepts and core principles of ${predictedSubject.name}.`,
          `2. Detailed analysis of Unit 1 and Unit 2 foundational methodologies with diagrams.`,
          `3. Compare design paradigms, real-world trade-offs, and implementation strategies in ${predictedSubject.name}.`,
          `4. Explain error handling, optimization techniques, and practical applications.`,
          `5. Discuss key questions and expected numerical/analytical case studies for upcoming university finals.`,
        ];

    return {
      message: `Here is the predicted question paper for ${predictedSubject.code} — ${predictedSubject.name}.`,
      intent,
      found: true,
      prediction: {
        subject: `${predictedSubject.code} — ${predictedSubject.name}`,
        questions: defaultQuestions,
        aiAnalysis: aiExamAnalysis || undefined,
        basis: pyqs.length > 0
          ? `${pyqs.length} university previous-year question entries and the 4 syllabus units were analyzed.`
          : `Synthesized from the official ${predictedSubject.code} syllabus curriculum and core topics.`,
      },
    };
  }

  // General Academic Query (Subject explanations / Q&A)
  if (intent === "GENERAL_ACADEMIC_QUERY") {
    // If LLM provider is active, answer the student's question academically!
    const promptWithAttachment = context.attachmentText
      ? `${rawText || "Please analyze and explain this academic document:"}\n\n[Attached Document: "${context.attachmentName || "Attachment"}"]:\n${context.attachmentText.slice(0, 3500)}`
      : context.attachmentName
      ? `${rawText || "Please explain this document"} (Referencing attached document: ${context.attachmentName})`
      : rawText;

    const systemPrompt = `You are RKhub AI, an academic assistant for Rajkumar College of IT and Management students. Explain academic concepts clearly, concisely, and accurately with examples.`;
    const answer = await callLlm(promptWithAttachment, systemPrompt);
    if (answer) {
      return {
        message: answer,
        intent,
        found: true,
      };
    }

    return {
      message: "I can help you find RKhub notes, PYQs, syllabus, reference materials, or predict upcoming exam questions. Try asking: 'Give me BCA 2nd year DBMS Unit 1 notes' or 'Predict DBMS exam questions'.",
      intent,
      found: false,
    };
  }

  // For FIND_NOTES, FIND_PYQ, FIND_SYLLABUS, FIND_REFERENCE:
  if (!subject) {
    return {
      message: "Which course or subject do you need? For example: 'BCA DBMS' or 'CC-202'.",
      intent,
      found: false,
    };
  }

  const resolvedType = TYPE_BY_INTENT[intent] || "notes";

  const rows = await query(
    `SELECT r.id, r.title, r.description, r.resource_type AS "resourceType",
            r.file_url AS "fileUrl", r.external_url AS "externalUrl",
            s.code AS "subjectCode", s.name AS "subjectName",
            u.unit_no AS "unitNo", u.name AS "unitName"
     FROM resources r
     JOIN subjects s ON s.id = r.subject_id
     LEFT JOIN units u ON u.id = r.unit_id
     JOIN courses c ON c.id = s.course_id
     WHERE r.resource_type = $1
       AND r.subject_id = $2
       AND ($3::int IS NULL OR u.unit_no = $3)
     ORDER BY (u.unit_no = $3) DESC, r.id DESC
     LIMIT 5`,
    [resolvedType, subject.id, unitNo ?? null]
  );

  if (!rows.length) {
    // If exact unit didn't have material, check if subject has any material for that type
    const anyRows = await query(
      `SELECT r.id, r.title, r.description, r.resource_type AS "resourceType",
              r.file_url AS "fileUrl", r.external_url AS "externalUrl",
              s.code AS "subjectCode", s.name AS "subjectName",
              u.unit_no AS "unitNo", u.name AS "unitName"
       FROM resources r
       JOIN subjects s ON s.id = r.subject_id
       LEFT JOIN units u ON u.id = r.unit_id
       WHERE r.resource_type = $1 AND r.subject_id = $2
       ORDER BY r.id DESC LIMIT 1`,
      [resolvedType, subject.id]
    );

    if (anyRows.length > 0) {
      const res = anyRows[0];
      return {
        message: `I found ${res.subjectName} ${resolvedType === "notes" ? "notes" : resolvedType === "pyq" ? "PYQ" : resolvedType === "reference" ? "reference" : "syllabus"} for you.`,
        intent,
        found: true,
        resource: {
          id: res.id,
          title: res.title,
          resourceType: res.resourceType,
          subjectCode: res.subjectCode,
          subjectName: res.subjectName,
          unitNo: res.unitNo,
          unitName: res.unitName,
          fileUrl: res.fileUrl,
          externalUrl: res.externalUrl,
        },
      };
    }

    return {
      message: `No ${resolvedType === "notes" ? "notes" : resolvedType === "pyq" ? "PYQ" : resolvedType} has been uploaded yet for ${subject.code} — ${subject.name}${unitNo ? ` (Unit ${unitNo})` : ""}. Check the Admin section to upload it.`,
      intent,
      found: false,
    };
  }

  const resource = rows[0];
  return {
    message: `I found your ${resource.subjectName} ${resolvedType === "notes" ? "notes" : resolvedType === "pyq" ? "PYQ" : resolvedType === "reference" ? "reference material" : "syllabus"}.`,
    intent,
    found: true,
    resource: {
      id: resource.id,
      title: resource.title,
      resourceType: resource.resourceType,
      subjectCode: resource.subjectCode,
      subjectName: resource.subjectName,
      unitNo: resource.unitNo,
      unitName: resource.unitName,
      fileUrl: resource.fileUrl,
      externalUrl: resource.externalUrl,
    },
  };
}
