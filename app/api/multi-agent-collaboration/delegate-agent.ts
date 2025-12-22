import { Agent } from "@mastra/core/agent";
import { threadMemory } from "../memory";
import { flash } from "../../utils/models";
import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { coderAgent } from "./coder-agent";

const coderTool = createTool({
  id: "coder",
  description: "A coder agent that can write code and help with software development tasks",
  inputSchema: z.object({
    prompt: z.string().describe("The coding task or question to give to the coder agent"),
  }),
  outputSchema: z.object({
    output: z.string().describe("The coder agent's response"),
  }),
  execute: async ({ context, writer }) => {
    const stream = await coderAgent.stream(context.prompt);

    if (writer) {
      await stream.fullStream.pipeTo(writer);
    }

    return {
      output: await stream.text,
    };
  },
});

export const delegateAgent = new Agent({
  name: "delegate-agent",
  instructions: `You respond to user queries by delegating work to other agents via your toolset.
  Don't try to create your own output.
  Make sure to credit the agents that you delegate to.
  After you've gotten results from the agents, make sure to summarize the results and return them to the user.`,
  model: flash,
  tools: {
    coder: coderTool,
  },
  memory: threadMemory,
});
