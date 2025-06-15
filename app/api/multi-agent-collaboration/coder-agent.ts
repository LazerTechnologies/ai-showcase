import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const coderAgent = new Agent({
  name: "coder-agent",
  instructions:
    "You are a coder agent. You're an expert in coding and software development. Be concise in your code output.",
  model: google("gemini-2.0-flash-exp"),
});
