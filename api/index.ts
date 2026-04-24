// This file acts as the Serverless Function entry point for Vercel.
// Vercel routes `/api/*` to this file based on `vercel.json`.

// We import the pre-bundled Express app to bypass Vercel's ESM module resolution errors
import app from "../dist/vercel.js";

export default app;
