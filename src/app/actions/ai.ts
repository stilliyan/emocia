"use server";

import OpenAI, { type APIConnectionError, type APIError } from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  PRODUCT_COPY_SYSTEM_PROMPT,
  productCopyInputSchema,
  productCopyOutputSchema,
  type ProductCopyInput,
  type ProductCopyOutput,
} from "@/lib/ai/product-copy";
import { beginAiRequest, finishAiRequest } from "@/lib/ai/rate-limit";
import { AdminAuthError, requireAdmin } from "@/lib/supabase/server";

type GenerateResult = { data?: ProductCopyOutput; error?: string };
const TEMPORARY_REJECTION_MESSAGE = "AI услугата временно отказа заявката. Изчакайте малко и опитайте отново.";
const GENERIC_ERROR_MESSAGE = "AI услугата временно не отговори. Опитайте отново.";
const isDevelopment = process.env.NODE_ENV === "development";
const developmentError = (message: string) => isDevelopment ? message : GENERIC_ERROR_MESSAGE;

function safeOpenAiErrorLog(error: APIError | APIConnectionError) {
  const configuredKey = process.env.OPENAI_API_KEY;
  const redactedMessage = configuredKey
    ? error.message.replaceAll(configuredKey, "[REDACTED]")
    : error.message;
  const shortMessage = redactedMessage
    .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .replace(/\s+/g, " ")
    .slice(0, 160);
  console.warn("OpenAI request failed", {
    status: error instanceof OpenAI.APIError ? (error.status ?? null) : null,
    type: error.name,
    message: shortMessage,
  });
}

function isTemporaryOpenAiRejection(error: APIError) {
  const message = error.message.toLowerCase();
  return (
    message.includes("unusual activity") ||
    message.includes("suspicious activity") ||
    message.includes("try again later")
  );
}

function isModelAccessError(error: APIError) {
  const message = error.message.toLowerCase();
  return error.code === "model_not_found" || error.status === 404 || message.includes("model") && (message.includes("access") || message.includes("not found") || message.includes("does not exist"));
}

async function requestStructuredCopy(client: OpenAI, input: ProductCopyInput) {
  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [
      { role: "system", content: PRODUCT_COPY_SYSTEM_PROMPT },
      { role: "user", content: `Продуктови данни:\n${JSON.stringify(input)}` },
    ],
    text: { format: zodTextFormat(productCopyOutputSchema, "product_content") },
  });
  return productCopyOutputSchema.safeParse(response.output_parsed);
}

export async function generateProductCopy(input: ProductCopyInput): Promise<GenerateResult> {
  let userId: string | null = null;
  let requestStarted = false;
  try {
    const { user } = await requireAdmin();
    userId = user.id;
    const decision = beginAiRequest(user.id);
    if (decision !== "acquired") {
      console.info("AI rate limit rejected", { reason: decision });
      return { error: decision === "active" ? developmentError("AI lock беше зает — опитайте след малко.") : developmentError("OpenAI rate limit / quota проблем.") };
    }
    console.info("AI rate limit accepted");
    console.info("AI lock acquired");
    requestStarted = true;
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "PASTE_KEY_HERE") return { error: developmentError("Липсва OpenAI API ключ.") };

    const parsedInput = productCopyInputSchema.safeParse(input);
    if (!parsedInput.success) return { error: "Попълнете поне име и категория и проверете дължината на полетата." };

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 20_000,
      maxRetries: 0,
    });
    console.info("OpenAI request started", { model: process.env.OPENAI_MODEL || "gpt-4o-mini" });
    let output = await requestStructuredCopy(client, parsedInput.data);
    if (!output.success) output = await requestStructuredCopy(client, parsedInput.data);
    if (!output.success) return { error: developmentError("Генерираният отговор беше невалиден. Опитайте отново.") };
    console.info("OpenAI request finished", { success: true });
    return { data: output.data };
  } catch (error) {
    if (error instanceof AdminAuthError) return { error: error.code === "unauthenticated" ? "Сесията е изтекла. Моля, влезте отново." : "Нямате права за тази операция." };
    if (error instanceof OpenAI.APIConnectionError) {
      safeOpenAiErrorLog(error);
      const timedOut = error.message.toLowerCase().includes("timed out") || error.message.toLowerCase().includes("timeout");
      return { error: timedOut ? developmentError("AI заявката timeout-на.") : GENERIC_ERROR_MESSAGE };
    }
    if (error instanceof OpenAI.APIError) {
      safeOpenAiErrorLog(error);
      if (isTemporaryOpenAiRejection(error)) return { error: TEMPORARY_REJECTION_MESSAGE };
      if (error.status === 401) return { error: developmentError("OpenAI ключът е невалиден.") };
      if (error.status === 429) return { error: developmentError("OpenAI rate limit / quota проблем.") };
      if (isModelAccessError(error) || error.status === 403) return { error: developmentError("OpenAI моделът не е достъпен.") };
    }
    return { error: GENERIC_ERROR_MESSAGE };
  } finally {
    if (userId && requestStarted) {
      finishAiRequest(userId);
      console.info("AI lock released");
    }
  }
}
