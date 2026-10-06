import type { Context } from "hono";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { query } from "./db.js";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
});

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
 * Verifies the Clerk JWT from the Authorization header.
 * Returns the authenticated user or null if unauthenticated.
 */
export async function authenticateUser(c: Context): Promise<AuthUser | null> {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || "",
    });

    const userId = payload.sub;
    if (!userId) return null;

    // Fetch name and email from Clerk
    let name: string | null = null;
    let email: string | null = null;
    try {
      const clerkUser = await clerk.users.getUser(userId);
      name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        null;
      email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    } catch {
      // Profile fetch is optional — token is still valid
    }

    const user: AuthUser = { id: String(userId), name, email };
    await upsertUser(user);
    return user;
  } catch (err: any) {
    console.warn("[Auth] Token verification failed:", err?.message || err);
    return null;
  }
}
