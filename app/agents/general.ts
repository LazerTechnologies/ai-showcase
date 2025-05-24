import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "./tools/weather";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generalAgent = new Agent({
  name: "general-agent",
  instructions:
    "You are a general-purpose agent. You're able to use tools or respond without tools.",
  model: google("gemini-2.0-flash-exp"),
  tools: {
    weatherTool,
  },
});
