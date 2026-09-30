import crypto from "node:crypto";
import type { Context } from "hono";
import { query } from "./db.js";

// Bypass corporate SSL proxy issues during local development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface JwkKey {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg?: string;
  use?: string;
}

let cachedJwks: { keys: JwkKey[]; fetchedAt: number } | null = null;

function getClerkDomain(): string {
  const pubKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "pk_test_ZWxlZ2FudC1tYWNhdy05Mzg0LmNsZXJrLmFjY291bnRzLmRldiQ";

  try {
    const raw = pubKey.replace(/^pk_(test|live)_/, "");
    const decoded = Buffer.from(raw, "base64").toString("utf-8").replace(/\$$/, "");
    if (decoded.includes(".")) {
      return decoded;
    }
  } catch {
    // ignore
  }
  return "elegant-macaw-9384.clerk.accounts.dev";
}

async function getClerkJwks(): Promise<JwkKey[]> {
  if (cachedJwks && Date.now() - cachedJwks.fetchedAt < 60 * 60 * 1000) {
    return cachedJwks.keys;
  }

  const domain = getClerkDomain();
  const jwksUrl = `https://${domain}/.well-known/jwks.json`;

  try {
    const res = await fetch(jwksUrl);
    if (!res.ok) {
      console.warn(`Failed to fetch JWKS from ${jwksUrl}: ${res.status}`);
      return cachedJwks?.keys || [];
    }
    const data = (await res.json()) as { keys: JwkKey[] };
    cachedJwks = {
      keys: data.keys || [],
      fetchedAt: Date.now(),
    };
    return cachedJwks.keys;
  } catch (err) {
    console.warn("Error fetching Clerk JWKS:", err);
    return cachedJwks?.keys || [];
  }
}

function parseJwt(token: string): { header: any; payload: any; signingInput: string; signature: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    return {
      header,
      payload,
      signingInput: `${parts[0]}.${parts[1]}`,
      signature: parts[2],
    };
  } catch {
    return null;
  }
}

async function verifyClerkJwt(token: string): Promise<AuthUser | null> {
  const parsed = parseJwt(token);
  if (!parsed) return null;

  const { header, payload, signingInput, signature } = parsed;

  if (payload.exp && Date.now() / 1000 > payload.exp) {
    return null; // Expired
  }

  if (payload.nbf && Date.now() / 1000 < payload.nbf - 10) {
    return null; // Not active yet
  }

  const keys = await getClerkJwks();
  const jwk = keys.find((k) => k.kid === header.kid) || keys[0];

  if (!jwk) {
    return null;
  }

  try {
    const publicKey = crypto.createPublicKey({
      key: jwk as any,
      format: "jwk",
    });

    const isVerified = crypto.verify(
      "RSA-SHA256",
      Buffer.from(signingInput),
      publicKey,
      Buffer.from(signature, "base64url")
    );

    if (!isVerified) {
      return null;
    }

    const userId = payload.sub;
    if (!userId) return null;

    const name =
      payload.name ||
      [payload.first_name, payload.last_name].filter(Boolean).join(" ") ||
      payload.username ||
      null;

    const email = payload.email || payload.email_address || null;

    return {
      id: String(userId),
      name,
      email,
    };
  } catch (err) {
    console.warn("Clerk JWT verification error:", err);
    return null;
  }
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
 * Extracts and cryptographically authenticates the current user.
 * Supports:
 * 1. Clerk session RS256 JWTs via Authorization: Bearer <token>
 * 2. Automated test tokens (in test/dev environment) via Authorization: Bearer test:<userId>:<name>
 */
export async function authenticateUser(c: Context): Promise<AuthUser | null> {
  const authHeader = c.req.header("authorization") || c.req.header("x-auth-token") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return null;
  }

  // 1. Support automated test tokens in test/dev mode
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

  // 2. Verify Clerk RS256 JWT
  const user = await verifyClerkJwt(token);
  if (user) {
    await upsertUser(user);
    return user;
  }

  return null;
}
