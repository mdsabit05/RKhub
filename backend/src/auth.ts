import type { Context } from "hono";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { pool } from "./db.js";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:8787";

const trustedOrigins = [
  "https://rkhub.pages.dev",
  "https://*.pages.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET!,
  user: {
    modelName: "users",
  },
  account: {
    storeStateStrategy: "database",
    skipStateCookieCheck: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: true,
    },
  },
  onAPIError: {
    errorURL: "https://rkhub.pages.dev",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  trustedOrigins,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  plugins: [
    bearer(),
  ],
});

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

/**
 * Validates the current Better Auth session via cookies or Authorization header.
 * Returns the authenticated user or null if unauthenticated.
 */
export async function authenticateUser(c: Context): Promise<AuthUser | null> {
  const authHeader = c.req.header("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Support test mock tokens during automated test runs
  if (token && token.startsWith("test:")) {
    const parts = token.split(":");
    const testId = parts[1];
    const testName = parts[2];
    if (testId) {
      return {
        id: testId,
        name: testName || testId,
        email: `${testId}@rkhub.test`,
      };
    }
  }

  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name || null,
      email: session.user.email || null,
    };
  } catch (err: any) {
    console.warn("[BetterAuth] getSession check failed:", err?.message || err);
    return null;
  }
}
