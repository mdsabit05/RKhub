import type { Context } from "hono";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { query } from "./db.js";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

// Clerk client — uses CLERK_SECRET_KEY from env (already set on Render)
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || "",
  publishableKey:
    process.env.CLERK_PUBLISHABLE_KEY ||
    "pk_test_ZWxlZ2FudC1tYWNhdy05Mzg0LmNsZXJrLmFjY291bnRzLmRldiQ",
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
 * Authenticates the current request via Clerk JWT.
 * Reads the Bearer token from the Authorization header and verifies it
 * using the official @clerk/backend SDK (JWKS + signature + expiry check).
 */
export async function authenticateUser(c: Context): Promise<AuthUser | null> {
  const authHeader = c.req.header("authorization") || c.req.header("x-auth-token") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) return null;

  // Dev-only test tokens: "test:userId:name"
  if (process.env.NODE_ENV !== "production" && token.startsWith("test:")) {
    const parts = token.split(":");
    const userId = parts[1]?.trim();
    const name = parts[2]?.trim() || "Test Student";
    if (userId) {
      const user = { id: userId, name, email: `${userId}@rkhub.test` };
      await upsertUser(user);
      return user;
    }
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || "",
    });

    const userId = payload.sub;
    if (!userId) return null;

    // Fetch full user profile for name/email
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
      // Profile fetch optional — token is still valid
    }

    const user: AuthUser = { id: String(userId), name, email };
    await upsertUser(user);
    return user;
  } catch (err: any) {
    console.warn("[Auth] Token verification failed:", err?.message || err);
    return null;
  }
}
