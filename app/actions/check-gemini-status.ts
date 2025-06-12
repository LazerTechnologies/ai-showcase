"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

export async function checkGeminiStatus() {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const testAgent = new Agent({
      name: "test-agent",
      instructions: "Say exactly this when spoken to: 'hi'",
      model: google("gemini-2.0-flash-exp"),
    });

    const result = await testAgent.generate([{ role: "user", content: "hi" }]);

    if (result.text.trim().toLowerCase() === "hi") {
      return { success: true };
    }

    console.error(`Gemini API check failed, received: \`${result.text}\``);

    return { success: false };
  } catch (error) {
    console.error("Gemini API check failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
