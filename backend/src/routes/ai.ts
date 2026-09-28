import { Hono } from "hono";
import { handleAcademicChat } from "../services/ai.service.js";

const ai = new Hono();

ai.post("/chat", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message : "";
  const context = body?.context ?? {};

  return c.json(await handleAcademicChat(message, context));
});

export default ai;
