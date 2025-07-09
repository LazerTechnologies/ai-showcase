import { Agent } from "@mastra/core/agent";
import { weatherTool } from "./weather-tool";
import { threadMemory } from "../memory";
import { flash } from "../../utils/models";

export const generalAgent = new Agent({
  name: "general-agent",
  instructions:
    "You are a general-purpose agent. You're able to use tools or respond without tools.",
  model: flash,
  tools: {
    weatherTool,
  },
  memory: threadMemory,
});
