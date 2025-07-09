
import { Agent } from "@mastra/core/agent";
import { threadMemory } from "../memory";



import { flash } from "../../utils/models";

export const delegateAgent = new Agent({
  name: "delegate-agent",
  instructions: `You respond to user queries by delegating work to other agents via your toolset.
  Don't try to create your own output.
  Make sure to credit the agents that you delegate to.`,
  model: flash,
  memory: threadMemory,
});
