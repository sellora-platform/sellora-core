import "dotenv/config";

// This file acts as the Serverless Function entry point for Vercel.
// Vercel routes `/api/*` to this file based on `vercel.json`.

import express from "express";

let app: express.Express;

try {
  // We import everything else INSIDE the try-catch to catch module resolution errors
  const { createExpressMiddleware } = await import("@trpc/server/adapters/express");
  const { registerAuthRoutes } = await import("../server/_core/oauth");
  const { appRouter } = await import("../server/routers");
  const { createContext } = await import("../server/_core/context");

  app = express();

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
} catch (err: any) {
  // If anything fails to load, we create a dummy app that just returns the error
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: "API Initialization Failed",
      message: err.message,
      stack: err.stack,
    });
  });
}

// We do NOT call app.listen() here because Vercel Serverless Functions 
// automatically wrap the exported app handler.
export default app;
