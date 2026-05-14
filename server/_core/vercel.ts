import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./oauth";
import { registerUploadRoutes } from "./upload";
import { appRouter } from "../routers";
import { createContext } from "./context";

const app = express();

// Global CORS & Preflight Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Robust subdomain matching
  const isAllowedOrigin = origin && (
    origin.endsWith('.raaenai.com') || 
    origin === 'https://raaenai.com' || 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1')
  );

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Auth routes
registerAuthRoutes(app);

// Upload routes
registerUploadRoutes(app);

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
