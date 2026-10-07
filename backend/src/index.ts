import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app.js";
import { ensureDatabaseSchema } from "./db.js";

const port = Number(process.env.PORT ?? 8787);

// Initialize database schema and then start HTTP server
ensureDatabaseSchema().finally(() => {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`RKhub API running at port ${info.port}`);
  });
});
