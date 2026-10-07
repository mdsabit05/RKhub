import { Hono } from "hono";
import { cors } from "hono/cors";
import { query } from "./db.js";
import ai from "./routes/ai.js";
import admin from "./routes/admin.js";
import resources from "./routes/resources.js";
import askRouter from "./routes/ask.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { auth } from "./auth.js";

const app = new Hono();

app.use("*", cors({
  origin: (origin) => {
    if (!origin) return "*";
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return origin;
    }
    if (origin.endsWith(".pages.dev") || origin === "https://rkhub.pages.dev") {
      return origin;
    }
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return origin;
    }
    return origin;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-admin-key", "Cookie"],
  credentials: true,
}));
app.use(
  "/pdfs/*",
  serveStatic({
    root: "./public",
  })
);

// Better Auth API routes
app.all("/api/auth/*", async (c) => {
  try {
    return await auth.handler(c.req.raw);
  } catch (err: any) {
    console.error("[BetterAuth handler error]:", err);
    return c.json({ error: err?.message || "Internal auth error" }, 500);
  }
});

app.get("/", (c) => c.json({
  name: "RKhub API",
  version: "1.0.0",
  message: "College academic resource backend",
}));

app.get("/health", async (c) => {
  try {
    await query("SELECT 1");
    return c.json({ ok: true, database: "connected" });
  } catch {
    return c.json({ ok: false, database: "unavailable" }, 503);
  }
});

app.route("/api/resources", resources);
app.route("/api/ai", ai);
app.route("/api/admin", admin);
app.route("/api/ask", askRouter);

export default app;
