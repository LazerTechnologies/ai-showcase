import { MCPClient } from "@mastra/mcp";
import { Agent } from "@mastra/core/agent";
import { flash } from "../../utils/models";
import { threadMemory } from "../memory";

const mcpClient = new MCPClient({
  servers: {
    context7: {
      url: new URL("https://mcp.context7.com/mcp"),
      // If you needed to provide any headers, you could do so here
      // requestInit: {
      //   headers: {
      //     Authorization: "Bearer your-token",
      //   },
      // },
    },
  },
});

export async function createMCPAgent() {
  return new Agent({
    name: "mcp-agent",
    instructions: `You are an agent that can perform various tasks.`,
    model: flash,
    tools: await mcpClient.getTools(),
    memory: threadMemory,
  });
}
