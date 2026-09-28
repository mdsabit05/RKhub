import { Hono } from "hono";

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

export default admin;
