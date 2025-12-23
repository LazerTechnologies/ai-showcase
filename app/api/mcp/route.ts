import { createMCPAgent } from "./agent";
import { UserService } from "../../../services/user";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const user = await UserService.createIfNotExists(userId);
  const { agent, mcpClient } = await createMCPAgent();
  const stream = await agent.stream(messages, {
    memory: {
      resource: user.id,
      thread: threadId,
    },
    onFinish: async () => {
      await mcpClient.disconnect();
    }
  });

  const uiMessageStream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(toAISdkFormat(stream, { from: 'agent' }));
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
