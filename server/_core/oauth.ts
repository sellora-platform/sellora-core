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
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "./auth";
import { getSessionCookieOptions } from "./cookies";
import { authenticateRequest } from "./auth";
import { sendMail } from "./mailer";

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

      const [newUser] = await db.insert(users).values({
        email,
        name: name || email.split("@")[0],
        passwordHash,
        role: "user",
      }).returning();

      const userId = newUser.id;

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
   * POST /api/auth/google
   * Authenticate with Google ID Token.
   */
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: "Google token is required" });
        return;
      }

      // Verify token with Google API
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const googleData = await googleRes.json();

      if (!googleRes.ok || googleData.error) {
        res.status(401).json({ error: "Invalid Google token" });
        return;
      }

      const { email, name, sub: googleId, picture } = googleData;

      // Find or create user
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // Create new user if doesn't exist
        [user] = await db.insert(users).values({
          email,
          name: name || email.split("@")[0],
          role: "user",
          lastSignedIn: new Date(),
        }).returning();
      } else {
        // Update last signed in
        await db
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, user.id));
      }

      // Create session
      const sessionToken = await createSessionToken({
        id: user.id,
        email: user.email!,
        name: user.name,
        role: user.role,
      });

      const cookieOpts = getSessionCookieOptions(req);
      res.cookie(SESSION_COOKIE_NAME, sessionToken, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      console.error("[Auth] Google Login error:", error);
      res.status(500).json({ error: "Google login failed" });
    }
  });

  /**
   * POST /api/auth/forgot-password
   * Send a password reset link.
   */
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        // Don't reveal user existence for security, but return success
        res.json({ success: true });
        return;
      }

      // Create a temporary token for password reset (valid for 1 hour)
      const resetToken = await createSessionToken({
        id: user.id,
        email: user.email!,
        name: user.name,
        role: user.role,
      });

      const resetLink = `${req.get("origin")}/reset-password?token=${resetToken}`;

      await sendMail({
        to: email,
        subject: "Reset your Sellora password",
        html: `
          <h1>Reset your password</h1>
          <p>Hi ${user.name || "there"},</p>
          <p>We received a request to reset your password. Click the link below to set a new one:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Forgot password error:", error);
      res.status(500).json({ error: "Failed to send reset link" });
    }
  });

  /**
   * POST /api/auth/reset-password
   * Update password using a reset token.
   */
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        res.status(400).json({ error: "Token and password are required" });
        return;
      }

      const payload = await verifySessionToken(token);
      if (!payload) {
        res.status(401).json({ error: "Invalid or expired reset link" });
        return;
      }

      const passwordHash = await hashPassword(password);
      await db.update(users).set({ passwordHash }).where(eq(users.id, payload.id));

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
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
