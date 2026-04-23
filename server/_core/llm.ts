/**
 * Sellora LLM Integration
 *
 * Provider-agnostic LLM service with Groq (free) as default.
 * Switch to OpenAI by changing LLM_PROVIDER env var — zero code changes.
 *
 * Supported providers:
 *   - "groq"   → Groq Cloud (free tier, Llama 3 / Mixtral)
 *   - "openai"  → OpenAI (GPT-4o-mini / GPT-4o)
 */
import Groq from "groq-sdk";
import { ENV } from "./env";

// ============================================================================
// Types
// ============================================================================

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMOptions = {
  messages: LLMMessage[];
  /** Model override. If not provided, uses sensible defaults per provider. */
  model?: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature (0-2). Lower = more deterministic. */
  temperature?: number;
};

export type LLMResponse = {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

// ============================================================================
// Provider: Groq (Default — Free Tier)
// ============================================================================

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    if (!ENV.groqApiKey) {
      throw new Error("GROQ_API_KEY is not configured. Get a free key at https://console.groq.com");
    }
    groqClient = new Groq({ apiKey: ENV.groqApiKey });
  }
  return groqClient;
}

async function invokeGroq(options: LLMOptions): Promise<LLMResponse> {
  const client = getGroqClient();
  const model = options.model ?? DEFAULT_GROQ_MODEL;

  const response = await client.chat.completions.create({
    model,
    messages: options.messages,
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
  });

  const choice = response.choices[0];
  return {
    content: choice?.message?.content ?? "",
    model,
    provider: "groq",
    usage: response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined,
  };
}

// ============================================================================
// Provider: OpenAI (Future — Paid)
// ============================================================================

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

async function invokeOpenAI(options: LLMOptions): Promise<LLMResponse> {
  if (!ENV.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const model = options.model ?? DEFAULT_OPENAI_MODEL;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.openaiApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenAI API error (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as any;
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    model,
    provider: "openai",
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

// ============================================================================
// Public API — Provider Router
// ============================================================================

/**
 * Send a message to the configured LLM provider.
 * Uses Groq by default, switch via LLM_PROVIDER env var.
 *
 * @example
 * const response = await invokeLLM({
 *   messages: [
 *     { role: "system", content: "You are a helpful e-commerce assistant." },
 *     { role: "user", content: "Write a product description for a blue denim jacket." },
 *   ],
 * });
 * console.log(response.content);
 */
export async function invokeLLM(options: LLMOptions): Promise<LLMResponse> {
  const provider = ENV.llmProvider;

  switch (provider) {
    case "openai":
      return invokeOpenAI(options);
    case "groq":
    default:
      return invokeGroq(options);
  }
}
