import { Hono } from "hono";
import { query } from "../db.js";
import { storageService } from "../services/storage.service.js";
import { isValidAdminKey } from "./admin.js";
import { authenticateUser } from "../auth.js";

const resources = new Hono();


function slugify(value: string, fallback: string) {
  const slug = String(value ?? fallback)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();

  return slug || fallback;
}

function subjectFolderName(subjectName: string, subjectCode?: string) {
  const text = String(subjectName ?? "").toLowerCase();
  if (text.includes("database management") || text.includes("data base management") || text.includes("dbms")) {
    return "dbms";
  }
  if (text.includes("operating system")) {
    return "operating-system";
  }
  if (text.includes("computer network")) {
    return "computer-network";
  }
  return slugify(subjectName || subjectCode || "subject", "subject");
}


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
  const rawType = c.req.query("type");
  const type = rawType === "pyqs" ? "pyq" : rawType;
  const subjectId = c.req.query("subjectId");
  const unitId = c.req.query("unitId");
  const year = c.req.query("year");
  const semester = c.req.query("semester");

  if (!["notes", "pyq", "syllabus", "reference", "complete_syllabus"].includes(type ?? "")) {
    return c.json({ error: "Invalid resource type" }, 400);
  }

  const params: unknown[] = [type];
  let sql = `
    SELECT r.id, r.title, r.description,
           r.resource_type AS "resourceType",
           r.file_url AS "fileUrl",
           r.external_url AS "externalUrl",
           r.year_no AS year,
           r.semester_no AS semester,
           r.uploaded_by AS "uploadedBy",
           u_auth.name AS "uploaderName",
           r.file_size AS "fileSize",
           r.created_at AS "createdAt",
           s.id AS "subjectId",
           s.code AS "subjectCode",
           s.name AS "subjectName",
           u.id AS "unitId",
           u.unit_no AS "unitNo",
           u.name AS "unitName"
    FROM resources r
    LEFT JOIN subjects s ON s.id = r.subject_id
    LEFT JOIN units u ON u.id = r.unit_id
    LEFT JOIN users u_auth ON u_auth.id = r.uploaded_by
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

  if (year) {
    params.push(Number(year));
    sql += ` AND r.year_no = $${params.length}`;
  }

  if (semester) {
    params.push(Number(semester));
    sql += ` AND r.semester_no = $${params.length}`;
  }

  sql += " ORDER BY r.created_at DESC, r.id DESC";
  const rows = await query(sql, params);
  return c.json({ resources: rows });
});

resources.get("/resolve", async (c) => {
  const rawType = c.req.query("type");
  const type = rawType === "pyqs" ? "pyq" : rawType;
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
           r.resource_type AS "resourceType",
           r.file_url AS "fileUrl",
           r.external_url AS "externalUrl",
           r.year_no AS year,
           r.semester_no AS semester,
           r.uploaded_by AS "uploadedBy",
           u_auth.name AS "uploaderName",
           r.file_size AS "fileSize",
           r.created_at AS "createdAt",
           s.code AS "subjectCode",
           s.name AS "subjectName",
           u.unit_no AS "unitNo",
           u.name AS "unitName"
    FROM resources r
    JOIN subjects s ON s.id = r.subject_id
    JOIN courses c ON c.id = s.course_id
    LEFT JOIN units u ON u.id = r.unit_id
    LEFT JOIN users u_auth ON u_auth.id = r.uploaded_by
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

  sql += " ORDER BY r.created_at DESC, r.id DESC";
  return c.json(await query(sql, params));
});

resources.post("/upload", async (c) => {
  const body = await c.req.parseBody();

  const user = await authenticateUser(c);

  const adminKey =
    c.req.header("x-admin-key") ||
    String(body.adminKey ?? "");

  const hasAdmin = isValidAdminKey(adminKey);

  if (!user && !hasAdmin) {
    return c.json({ error: "Unauthorized: Please sign in to upload resources." }, 401);
  }

  const type = String(body.resourceType ?? body.type ?? "").trim().toLowerCase();
  const year = Number(body.year ?? 0);
  const course = String(body.course ?? "").trim().toUpperCase();
  const semester = Number(body.semester ?? 0);
  const subjectId = Number(body.subjectId ?? 0);
  const unitId = body.unitId ? Number(body.unitId) : null;
  const title = String(body.title ?? "").trim();
  const file = body.file as File | undefined;

  if (!type || !["notes", "pyq", "syllabus", "reference", "complete_syllabus"].includes(type)) {
    return c.json({ error: "Invalid resource type" }, 400);
  }

  if (type !== "complete_syllabus" && (!course || !year || !semester)) {
    return c.json({ error: "Year, course and semester are required" }, 400);
  }

  // Handle complete_syllabus separately — no subject/unit/year/semester required
  if (type === "complete_syllabus") {
    if (!file || !(file instanceof File)) {
      return c.json({ error: "PDF file is required" }, 400);
    }
    const folder = "complete-syllabus";
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await storageService.upload({
      fileName: "complete-syllabus.pdf",
      buffer: fileBuffer,
      folder,
      mimeType: "application/pdf",
    });
    const uploaderId = user ? user.id : null;
    const insertResult = await query(
      `INSERT INTO resources (resource_type, subject_id, unit_id, year_no, semester_no, title, description, file_url, uploaded_by, file_size)
       VALUES ($1, NULL, NULL, NULL, NULL, $2, $3, $4, $5, $6)
       RETURNING id, title, file_url AS "fileUrl", uploaded_by AS "uploadedBy", file_size AS "fileSize", created_at AS "createdAt"`,
      [type, title || "Complete 4-Year Syllabus", "Complete course syllabus", uploadResult.fileUrl, uploaderId, fileBuffer.length]
    );
    return c.json({ message: "Resource uploaded successfully.", resource: insertResult[0] }, 201);
  }

  if (!file || !(file instanceof File)) {
    return c.json({ error: "PDF file is required" }, 400);
  }

  const fileName = String(file.name ?? "resource.pdf").toLowerCase();
  if (!fileName.endsWith(".pdf")) {
    return c.json({ error: "Only PDF files are allowed" }, 400);
  }

  let subject = null as any;

  if (subjectId) {
    const rows = await query(
      `SELECT s.id, s.code, s.name, s.year_no AS "yearNo", s.semester_no AS "semesterNo",
              c.code AS "courseCode"
       FROM subjects s
       JOIN courses c ON c.id = s.course_id
       WHERE s.id = $1`,
      [subjectId]
    );
    subject = rows[0] ?? null;
  }

  if (!subject) {
    const subjectCode = String(body.subjectCode ?? "").trim();
    const rows = await query(
      `SELECT s.id, s.code, s.name, s.year_no AS "yearNo", s.semester_no AS "semesterNo",
              c.code AS "courseCode"
       FROM subjects s
       JOIN courses c ON c.id = s.course_id
       WHERE c.code = $1 AND s.year_no = $2 AND s.semester_no = $3 AND (LOWER(s.code) = LOWER($4) OR LOWER(s.name) LIKE LOWER($5))
       LIMIT 1`,
      [course, year, semester, subjectCode || "", `${subjectCode || "%"}%`]
    );
    subject = rows[0] ?? null;
  }

  if (!subject) {
    return c.json({ error: "Subject not found for the selected year/course/semester" }, 400);
  }

  if (["notes", "reference"].includes(type) && !unitId) {
    return c.json({ error: "Unit is required for this resource type" }, 400);
  }

  const unit = unitId
    ? (await query(`SELECT id, unit_no AS "unitNo", name FROM units WHERE id = $1 LIMIT 1`, [unitId]))[0] ?? null
    : null;

  if (["notes", "reference"].includes(type) && !unit) {
    return c.json({ error: "Selected unit not found" }, 400);
  }

  const courseFolder = String(subject.courseCode ?? course).toLowerCase();
  const semesterFolder = `sem${String(subject.semesterNo ?? semester)}`;
  const subjectFolder = subjectFolderName(subject.name, subject.code);
  const destinationName = type === "syllabus"
    ? "syllabus.pdf"
    : unit
      ? `unit-${unit.unitNo}.pdf`
      : `resource.pdf`;

  const folder = `${type}/${courseFolder}/${semesterFolder}/${subjectFolder}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await storageService.upload({
    fileName: destinationName,
    buffer: fileBuffer,
    folder,
    mimeType: "application/pdf",
  });

  const relativeUrl = uploadResult.fileUrl;

  // Derive uploader ID strictly from authenticated session
  const uploaderId = user ? user.id : null;

  const insertResult = await query(
    `INSERT INTO resources (
       resource_type, subject_id, unit_id, year_no, semester_no, title, description, file_url, uploaded_by, file_size
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, title, file_url AS "fileUrl", uploaded_by AS "uploadedBy", file_size AS "fileSize", created_at AS "createdAt"`,
    [
      type,
      subject.id,
      unit ? unit.id : null,
      Number(subject.yearNo ?? year),
      Number(subject.semesterNo ?? semester),
      title || `${subject.code} - ${unit ? `Unit ${unit.unitNo}` : "Syllabus"}`,
      `Uploaded ${type} resource`,
      relativeUrl,
      uploaderId,
      fileBuffer.length,
    ]
  );

  return c.json({
    message: "Resource uploaded successfully.",
    fileUrl: relativeUrl,
    storage: uploadResult.storageProvider,
    resource: insertResult[0],
  }, 201);
});

resources.get("/:id/file", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid resource id" }, 400);
  }

  const rows = await query(
    `SELECT file_url AS "fileUrl" FROM resources WHERE id = $1`,
    [id]
  );

  if (!rows.length || !rows[0].fileUrl) {
    return c.json({ error: "Resource not found" }, 404);
  }

  return storageService.proxyFile(rows[0].fileUrl);
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
            r.uploaded_by AS "uploadedBy",
            u_auth.name AS "uploaderName",
            r.file_size AS "fileSize",
            r.created_at AS "createdAt",
            s.id AS "subjectId", s.code AS "subjectCode", s.name AS "subjectName",
            u.id AS "unitId", u.unit_no AS "unitNo", u.name AS "unitName"
     FROM resources r
     LEFT JOIN subjects s ON s.id = r.subject_id
     LEFT JOIN units u ON u.id = r.unit_id
     LEFT JOIN users u_auth ON u_auth.id = r.uploaded_by
     WHERE r.id = $1`,
    [id]
  );

  if (!rows.length) return c.json({ error: "Resource not found" }, 404);
  return c.json(rows[0]);
});

resources.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid resource id" }, 400);
  }

  const user = await authenticateUser(c);
  const adminKey = c.req.header("x-admin-key");
  const hasAdmin = isValidAdminKey(adminKey);

  if (!user && !hasAdmin) {
    return c.json({ error: "Unauthorized: Please sign in or provide admin key to delete this resource." }, 401);
  }

  const rows = await query(
    `SELECT id, title, file_url AS "fileUrl", uploaded_by AS "uploadedBy"
     FROM resources
     WHERE id = $1`,
    [id]
  );

  if (!rows.length) {
    return c.json({ error: "Resource not found" }, 404);
  }

  const resource = rows[0];

  // If not admin, enforce ownership check
  if (!hasAdmin) {
    if (!resource.uploadedBy || !user || resource.uploadedBy !== user.id) {
      return c.json({ error: "You can only delete resources uploaded by you." }, 403);
    }
  }

  // Delete file from storage (Backblaze B2 or local) first
  if (resource.fileUrl) {
    try {
      await storageService.delete(resource.fileUrl);
    } catch (err: any) {
      console.error("Storage deletion failed:", err);
      return c.json({
        error: "Failed to delete file from storage. Database record was preserved.",
        details: err.message,
      }, 500);
    }
  }

  // Delete database record
  await query("DELETE FROM resources WHERE id = $1", [id]);

  return c.json({
    message: "Resource deleted successfully.",
    id,
  });
});

export default resources;

