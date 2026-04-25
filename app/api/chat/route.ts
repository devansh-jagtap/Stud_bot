import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  type ModelMessage,
} from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages }: { messages?: UIMessage[] | ModelMessage[] } =
      await request.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages payload" }), {
        status: 400,
      });
    }

    const modelMessages =
      messages.length === 0
        ? []
        : "parts" in messages[0]
          ? await convertToModelMessages(messages as UIMessage[])
          : (messages as ModelMessage[]);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse(); // ✅ matches sendMessage on frontend

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}