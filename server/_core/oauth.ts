/**
 * Sellora Auth Routes
 *
 * Handles user registration, login, logout, and session info.
 * Replaces the Manus OAuth callback system with email/password auth.
 */
import type { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "./auth";
import { getSessionCookieOptions } from "./cookies";
import { authenticateRequest } from "./auth";

export function registerAuthRoutes(app: Express) {
  /**
   * POST /api/auth/register
   * Create a new account with email and password.
   */
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
      }

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);

      const result = await db.insert(users).values({
        email,
        name: name || email.split("@")[0],
        passwordHash,
        role: "user",
      });

      const userId = Number((result as any).insertId ?? (result as any)[0]?.id);

      // Create session
      const token = await createSessionToken({
        id: userId,
        email,
        name: name || email.split("@")[0],
        role: "user",
      });

      const cookieOpts = getSessionCookieOptions(req);
      res.cookie(SESSION_COOKIE_NAME, token, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        user: { id: userId, email, name: name || email.split("@")[0], role: "user" },
      });
    } catch (error) {
      console.error("[Auth] Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  /**
   * POST /api/auth/login
   * Authenticate with email and password.
   */
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Verify password
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Update last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Create session
      const token = await createSessionToken({
        id: user.id,
        email: user.email!,
        name: user.name,
        role: user.role,
      });

      const cookieOpts = getSessionCookieOptions(req);
      res.cookie(SESSION_COOKIE_NAME, token, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  /**
   * POST /api/auth/logout
   * Clear the session cookie.
   */
  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME);
    res.json({ success: true });
  });

  /**
   * GET /api/auth/me
   * Get the current authenticated user info.
   */
  app.get("/api/auth/me", async (req, res) => {
    const { user } = await authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({ user });
  });
}
