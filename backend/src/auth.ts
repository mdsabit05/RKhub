import type { Context } from "hono";
import { query } from "./db.js";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export async function upsertUser(user: AuthUser): Promise<void> {
  await query(
    `INSERT INTO users (id, name, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, users.name),
       email = COALESCE(EXCLUDED.email, users.email)`,
    [user.id, user.name || null, user.email || null]
  );
}

/**
 * Placeholder — authentication is being replaced.
 * Always returns null (unauthenticated) until the new auth system is wired in.
 */
export async function authenticateUser(_c: Context): Promise<AuthUser | null> {
  return null;
}
