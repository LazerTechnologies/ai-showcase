import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const delegateAgent = new Agent({
  name: "delegate-agent",
  instructions: `You are a general-purpose agent. You don't have any tools, or produce output yourself, but you can delegate to other agents.
    Try not to ask clarifier questions unless absolutely necessary.
    When agents do work for you, make sure to express your appreciation.`,
  model: google("gemini-2.0-flash-exp"),
});
