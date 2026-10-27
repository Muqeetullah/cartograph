import OpenAI from "openai";
import { wrapOpenAI } from "langsmith/wrappers/openai";

// The one place the AI client is constructed. A client built anywhere else
// would work and silently go untraced, so nothing else imports "openai".

// Use a coding model, rather than the random free router, which can select
// a moderation model. Changing this ID also invalidates cached answers.
export const MODELS = {
  explain: "poolside/laguna-s-2.1:free",
  classify: "poolside/laguna-s-2.1:free",
} as const;

export type TracingStatus = { on: true; project: string } | { on: false; reason: string };

// An absent key looks exactly like a working setup with no traffic, so the
// state is reported with every answer instead of being inferred.
export function tracingStatus(): TracingStatus {
  if (process.env.LANGSMITH_TRACING?.trim() !== "true") return { on: false, reason: "LANGSMITH_TRACING isn't \"true\"" };
  if (!process.env.LANGSMITH_API_KEY?.trim()) return { on: false, reason: "LANGSMITH_API_KEY isn't set" };
  return { on: true, project: process.env.LANGSMITH_PROJECT?.trim() || "default" };
}

let client: OpenAI | null = null;

// Built on first use rather than at import, so a missing key fails the call
// that needed it with a message saying so, not the server's boot.
export function ai(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY isn't set in .env.local, so nothing can be explained");
  client = wrapOpenAI(new OpenAI({ apiKey, baseURL: "https://openrouter.ai/api/v1", timeout: 45_000, maxRetries: 0 }), { tracingEnabled: tracingStatus().on });
  return client;
}

/**
 * How every traced step is recorded. Whatever runs inside it, the cache read
 * included, is one run, so a cache hit shows up as a run with no model call
 * under it. With tracing off the function runs exactly the same, untraced.
 */
export function traceConfig(name: string) {
  return { name, run_type: "chain", tracingEnabled: tracingStatus().on } as const;
}

// All model calls pass through this boundary. Never accept a paid model or
// route to an endpoint with nonzero token pricing, even if availability changes.
export async function completeFree(params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming) {
  if (!Object.values(MODELS).some((model) => model === params.model)) {
    throw new Error("Only the configured free models may be used");
  }
  const request = {
    ...params,
    max_tokens: params.max_tokens ?? 2048,
    provider: { max_price: { prompt: 0, completion: 0 } },
  };
  try {
    return await ai().chat.completions.create(request);
  } catch (error) {
    if (error instanceof OpenAI.APIError && error.status === 429) {
      throw new Error("The free AI provider is busy or its free request limit was reached. Try again later. No paid model will be used.");
    }
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new Error("The free AI provider took too long to respond. Try again. No paid model will be used.");
    }
    throw error;
  }
}
