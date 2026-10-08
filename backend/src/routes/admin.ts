import { Hono } from "hono";
import { query } from "../db.js";
import { storageService } from "../services/storage.service.js";

const admin = new Hono();

export function isValidAdminKey(key?: string | null): boolean {
  const expectedKey = process.env.ADMIN_SECRET_KEY || "rkhub-admin-2026";
  return Boolean(key && key.trim() === expectedKey.trim());
}

admin.post("/verify", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const key = String(body?.key ?? "").trim();

  if (isValidAdminKey(key)) {
    return c.json({ ok: true, message: "Admin access granted" });
  }

  return c.json({ ok: false, error: "Invalid admin key" }, 401);
});

// Admin: Get ALL uploaded PDFs from all users across the entire platform
admin.get("/resources", async (c) => {
  const key = c.req.header("x-admin-key") || c.req.query("key");
  if (!isValidAdminKey(key)) {
    return c.json({ error: "Unauthorized: Invalid admin key" }, 401);
  }

  const sql = `
    SELECT r.id, r.title, r.description,
           r.resource_type AS "resourceType",
           r.file_url AS "fileUrl",
           r.external_url AS "externalUrl",
           r.year_no AS year,
           r.semester_no AS semester,
           r.uploaded_by AS "uploadedBy",
           u_auth.name AS "uploaderName",
           u_auth.email AS "uploaderEmail",
           r.file_size AS "fileSize",
           r.created_at AS "createdAt",
           s.id AS "subjectId",
           s.code AS "subjectCode",
           s.name AS "subjectName",
           c.code AS "courseCode",
           c.name AS "courseName",
           u.id AS "unitId",
           u.unit_no AS "unitNo",
           u.name AS "unitName"
    FROM resources r
    LEFT JOIN subjects s ON s.id = r.subject_id
    LEFT JOIN courses c ON c.id = s.course_id
    LEFT JOIN units u ON u.id = r.unit_id
    LEFT JOIN users u_auth ON u_auth.id = r.uploaded_by
    ORDER BY r.created_at DESC, r.id DESC
  `;

  const rows = await query(sql);
  return c.json({
    ok: true,
    total: rows.length,
    resources: rows,
  });
});

// Admin: Force delete ANY resource regardless of who uploaded it
admin.delete("/resources/:id", async (c) => {
  const key = c.req.header("x-admin-key") || c.req.query("key");
  if (!isValidAdminKey(key)) {
    return c.json({ error: "Unauthorized: Invalid admin key" }, 401);
  }

  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid resource id" }, 400);
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

  // Delete from cloud/local storage
  if (resource.fileUrl) {
    try {
      await storageService.delete(resource.fileUrl);
    } catch (err: any) {
      console.warn("Storage deletion warning:", err);
    }
  }

  // Delete record from database
  await query("DELETE FROM resources WHERE id = $1", [id]);

  return c.json({
    ok: true,
    message: "Resource permanently deleted by admin.",
    id,
  });
});

export default admin;
