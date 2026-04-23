/**
 * Sellora Authentication Service
 *
 * Handles JWT session management, password hashing, and request authentication.
 * Replaces the Manus OAuth SDK with our own standalone auth system.
 */
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Request } from "express";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

// ============================================================================
// Types
// ============================================================================

export type SessionUser = {
  id: number;
  email: string;
  name: string | null;
  role: "user" | "admin";
};

export type AuthResult = {
  user: SessionUser | null;
};

// ============================================================================
// Password Hashing
// ============================================================================

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT Session Management
// ============================================================================

const SESSION_COOKIE_NAME = "sellora_session";
const SESSION_DURATION = "7d"; // 7 days

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(ENV.jwtSecret);
}

/**
 * Create a signed JWT session token for a user.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .setSubject(String(user.id))
    .sign(getJwtSecret());
}

/**
 * Verify and decode a JWT session token.
 * Returns the user payload or null if invalid/expired.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: (payload.name as string) ?? null,
      role: (payload.role as "user" | "admin") ?? "user",
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Cookie Helpers
// ============================================================================

export { SESSION_COOKIE_NAME };

/**
 * Extract the session token from the request cookie.
 */
export function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    })
  );

  return cookies[SESSION_COOKIE_NAME] || null;
}

/**
 * Authenticate a request by verifying the session cookie.
 * Returns the user if authenticated, null otherwise.
 */
export async function authenticateRequest(
  req: Request
): Promise<AuthResult> {
  const token = getTokenFromRequest(req);
  if (!token) return { user: null };

  const user = await verifySessionToken(token);
  return { user };
}
