import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const delegateAgent = new Agent({
  name: "delegate-agent",
  instructions: `You respond to user queries by delegating work to other agents via your toolset.
  Don't try to create your own output.
  Make sure to credit the agents that you delegate to.`,
  model: google("gemini-2.0-flash-exp"),
});
