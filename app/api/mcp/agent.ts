import { Agent } from "@mastra/core/agent";
import { flash } from "../../utils/models";
import { threadMemory } from "../memory";
import { mcpClient } from "./mcp-client";

export async function createMCPAgent() {
  return new Agent({
    name: "mcp-agent",
    instructions: `You are an agent that can perform various tasks.`,
    model: flash,
    tools: await mcpClient.getTools(),
    memory: threadMemory,
  });
}
