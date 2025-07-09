import { Agent } from "@mastra/core/agent";
import { flash } from "../../utils/models";

export const coderAgent = new Agent({
  name: "coder-agent",
  instructions:
    "You are a coder agent. You're an expert in coding and software development. Be concise in your code output.",
  model: flash,
});
