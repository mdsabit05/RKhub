import { Hono } from "hono";
import { query } from "../db.js";

const resources = new Hono();

resources.get("/years", async (c) => {
  return c.json(await query(
    "SELECT year_no AS year, name FROM academic_years ORDER BY year_no"
  ));
});

resources.get("/courses", async (c) => {
  const year = c.req.query("year");

  if (!year) {
    return c.json(await query(
      "SELECT id, code, name FROM courses ORDER BY name"
    ));
  }

  return c.json(await query(
    `SELECT DISTINCT c.id, c.code, c.name
     FROM courses c
     JOIN subjects s ON s.course_id = c.id
     WHERE s.year_no = $1
     ORDER BY c.name`,
    [Number(year)]
  ));
});

resources.get("/semesters", async (c) => {
  const year = c.req.query("year");
  if (!year) return c.json({ error: "year is required" }, 400);

  return c.json(await query(
    `SELECT id, semester_no AS semester, name
     FROM semesters
     WHERE year_no = $1
     ORDER BY semester_no`,
    [Number(year)]
  ));
});

resources.get("/subjects", async (c) => {
  const year = c.req.query("year");
  const course = c.req.query("course");
  const semester = c.req.query("semester");

  if (!year || !course || !semester) {
    return c.json({ error: "year, course and semester are required" }, 400);
  }

  return c.json(await query(
    `SELECT s.id, s.code, s.name, s.subject_type AS "subjectType"
     FROM subjects s
     JOIN courses c ON c.id = s.course_id
     WHERE s.year_no = $1
       AND c.code = $2
       AND s.semester_no = $3
     ORDER BY s.display_order, s.code`,
    [Number(year), course, Number(semester)]
  ));
});

resources.get("/units", async (c) => {
  const subjectId = c.req.query("subjectId");
  if (!subjectId) return c.json({ error: "subjectId is required" }, 400);

  return c.json(await query(
    `SELECT id, unit_no AS "unitNo", name
     FROM units
     WHERE subject_id = $1
     ORDER BY unit_no`,
    [Number(subjectId)]
  ));
});

resources.get("/list", async (c) => {
  const type = c.req.query("type");
  const subjectId = c.req.query("subjectId");
  const unitId = c.req.query("unitId");

  if (!["notes", "pyq", "syllabus", "reference"].includes(type ?? "")) {
    return c.json({ error: "Invalid resource type" }, 400);
  }

  const params: unknown[] = [type];
  let sql = `
    SELECT r.id, r.title, r.description,
           r.file_url AS "fileUrl",
           r.external_url AS "externalUrl",
           r.year_no AS year,
           r.semester_no AS semester,
           s.code AS "subjectCode",
           s.name AS "subjectName",
           u.unit_no AS "unitNo",
           u.name AS "unitName"
    FROM resources r
    LEFT JOIN subjects s ON s.id = r.subject_id
    LEFT JOIN units u ON u.id = r.unit_id
    WHERE r.resource_type = $1
  `;

  if (subjectId) {
    params.push(Number(subjectId));
    sql += ` AND r.subject_id = $${params.length}`;
  }

  if (unitId) {
    params.push(Number(unitId));
    sql += ` AND r.unit_id = $${params.length}`;
  }

  sql += " ORDER BY r.title";
  return c.json(await query(sql, params));
});

resources.get("/resolve", async (c) => {
  const type = c.req.query("type");
  const year = c.req.query("year");
  const course = c.req.query("course");
  const semester = c.req.query("semester");
  const subjectCode = c.req.query("subjectCode");
  const unitNo = c.req.query("unitNo");

  if (!type || !year || !course || !semester || !subjectCode) {
    return c.json({
      error: "type, year, course, semester and subjectCode are required"
    }, 400);
  }

  const params: unknown[] = [
    type, Number(year), course, Number(semester), subjectCode
  ];

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
    params.push(Number(unitNo));
    sql += ` AND u.unit_no = $${params.length}`;
  }

  sql += " ORDER BY r.title";
  return c.json(await query(sql, params));
});


resources.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid resource id" }, 400);
  }

  const rows = await query(
    `SELECT r.id, r.resource_type AS "resourceType", r.title, r.description,
            r.file_url AS "fileUrl", r.external_url AS "externalUrl",
            r.year_no AS year, r.semester_no AS semester,
            s.id AS "subjectId", s.code AS "subjectCode", s.name AS "subjectName",
            u.id AS "unitId", u.unit_no AS "unitNo", u.name AS "unitName"
     FROM resources r
     LEFT JOIN subjects s ON s.id = r.subject_id
     LEFT JOIN units u ON u.id = r.unit_id
     WHERE r.id = $1`,
    [id]
  );

  if (!rows.length) return c.json({ error: "Resource not found" }, 404);
  return c.json(rows[0]);
});

export default resources;
