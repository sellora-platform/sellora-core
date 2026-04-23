/**
 * Sellora Environment Configuration
 *
 * All environment variables used by the backend are centralized here.
 * This ensures a single source of truth and makes it easy to see
 * what the platform requires to run.
 */
export const ENV = {
  /** PostgreSQL connection string (Neon) */
  databaseUrl: process.env.DATABASE_URL ?? "",

  /** Secret key for signing JWT session tokens */
  jwtSecret: process.env.JWT_SECRET ?? "sellora-dev-secret-change-in-production",

  /** Groq API key for LLM integration (free tier) */
  groqApiKey: process.env.GROQ_API_KEY ?? "",

  /** OpenAI API key (future — for GPT-4o, DALL-E, vision features) */
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",

  /** Which LLM provider to use: "groq" | "openai" */
  llmProvider: (process.env.LLM_PROVIDER ?? "groq") as "groq" | "openai",

  /** Cloudinary cloud name for image storage */
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",

  /** Cloudinary API key */
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",

  /** Cloudinary API secret */
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",

  /** Server port */
  port: parseInt(process.env.PORT ?? "3000", 10),

  /** Node environment */
  nodeEnv: process.env.NODE_ENV ?? "development",

  /** Is production? */
  isProduction: process.env.NODE_ENV === "production",
} as const;
