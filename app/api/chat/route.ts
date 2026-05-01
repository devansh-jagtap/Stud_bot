import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

// Each bot gets a system prompt — this is the instruction
// the AI reads before the conversation starts.
// The user never sees this. It's your way of giving the AI a personality.
const SYSTEM_PROMPTS: Record<string, string> = {
  educational: `You are a patient, encouraging educational tutor.
    Break down complex topics into simple steps.
    Use real-world analogies and examples.
    After explaining something, ask if the user wants to go deeper or test themselves.
    Always make learning feel achievable, never overwhelming.`,

  coding: `You are a senior software engineer and pair programmer.
    Write clean, well-commented code. Always explain your reasoning.
    Point out potential bugs, edge cases, or better approaches.
    If the language or framework isn't specified, ask before assuming.
    Format code properly in code blocks.`,

  work: `You are a sharp, professional work assistant.
    Help with emails, reports, meeting notes, planning, and communication.
    Be concise and structured. Use bullet points when it helps clarity.
    When writing emails, ask about the desired tone (formal vs casual) if unclear.`,

  content: `You are a creative content writer with a human, engaging voice.
    Write posts, scripts, captions, and newsletters that feel authentic — never robotic.
    Adapt your tone to the platform: punchy for Twitter, thoughtful for LinkedIn, warm for email.
    Always offer to rewrite in a different style or length.`,
};

export async function POST(request: Request) {
  try {
    // Before: only read messages
    // After: also read botType that the frontend sends
    const { messages, botType }: { messages: UIMessage[]; botType: string } = await request.json();

    const modelMessages = await convertToModelMessages(messages);

    // Look up the system prompt for this bot.
    // If somehow botType doesn't match, fall back to a generic prompt.
    const systemPrompt = SYSTEM_PROMPTS[botType] ?? "You are a helpful assistant.";

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt, // THIS is what makes each bot different
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}