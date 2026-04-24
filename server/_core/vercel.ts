import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

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

export default app;
