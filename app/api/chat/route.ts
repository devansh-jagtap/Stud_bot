import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { gateway } from "@ai-sdk/gateway";

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const cerebras = createOpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

const SYSTEM_PROMPTS: Record<string, string> = {
  educational: `You are a patient tutor. Break topics into simple steps with analogies.`,
  coding: `You are a senior engineer. Write clean commented code, explain reasoning, use code blocks.`,
  work: `You are a professional assistant. Help with emails, reports. Be concise and structured.`,
  content: `You are a creative writer. Write authentic content, adapt tone to platform.`,
};

function pickModel(botType: string, isPremium: boolean, selectedModel?: string) {
  if (selectedModel) {
    // route based on provider prefix in the model id
    if (selectedModel.includes("/") && !selectedModel.startsWith("gemini")) {
      if (isPremium) return gateway(selectedModel);
      return openrouter(selectedModel.replace(":free", "") + ":free");
    }
    if (selectedModel.startsWith("gemini")) return google(selectedModel);
    if (selectedModel.startsWith("llama") || selectedModel.startsWith("qwen") || selectedModel.startsWith("deepseek")) return groq(selectedModel);
    if (selectedModel.startsWith("llama3")) return cerebras(selectedModel);
  }
  // fallback
  return google("gemini-3-flash-preview");
}

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages, botType, isPremium, selectedModel }: {
      messages: UIMessage[];
      botType: string;
      isPremium: boolean;
      selectedModel?: string;
    } = await request.json();

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: pickModel(botType, isPremium, selectedModel),
      system: SYSTEM_PROMPTS[botType] ?? "You are a helpful assistant.",
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}