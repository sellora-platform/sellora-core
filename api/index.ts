import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

// This file acts as the Serverless Function entry point for Vercel.
// Vercel routes `/api/*` to this file based on `vercel.json`.

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Auth routes
registerAuthRoutes(app);

// Simple health check to verify Express is starting
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV, hasDbUrl: !!process.env.DATABASE_URL, hasJwt: !!process.env.JWT_SECRET });
});

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// We do NOT call app.listen() here because Vercel Serverless Functions 
// automatically wrap the exported app handler.
export default app;
