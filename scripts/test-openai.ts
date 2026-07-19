import { loadEnvConfig } from "@next/env";
import OpenAI, { type APIError } from "openai";

loadEnvConfig(process.cwd(), true);

const key = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

function safeMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : "Unknown error";
  const redacted = key ? raw.replaceAll(key, "[REDACTED]") : raw;
  return redacted.replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]").replace(/\s+/g, " ").slice(0, 160);
}

console.log("OPENAI_API_KEY present:", Boolean(key));
console.log("OPENAI_API_KEY prefix valid:", Boolean(key?.startsWith("sk-") && key.length > 20));
console.log("model:", model);

async function main() {
  if (!key) {
    console.log("status:", null);
    console.log("success:", false);
    console.log("error type:", "MissingApiKey");
    console.log("message:", "Invalid or missing OpenAI API key");
    process.exitCode = 1;
    return;
  }

  const client = new OpenAI({ apiKey: key, timeout: 20_000, maxRetries: 0 });
  try {
    const response = await client.responses.create({ model, input: "Return OK", max_output_tokens: 16 });
    console.log("status:", 200);
    console.log("success:", response.output_text.trim().toUpperCase().includes("OK"));
    console.log("error type:", null);
    console.log("message:", response.output_text.trim().slice(0, 40));
  } catch (error) {
    const apiError = error as Partial<APIError>;
    console.log("status:", apiError.status ?? null);
    console.log("success:", false);
    console.log("error type:", error instanceof Error ? error.name : "UnknownError");
    console.log("message:", safeMessage(error));
    process.exitCode = 1;
  }
}

void main();
