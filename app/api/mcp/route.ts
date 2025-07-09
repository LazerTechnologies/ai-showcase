import { createMCPAgent } from "./agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const mcpAgentInstance = await createMCPAgent();
  const stream = await mcpAgentInstance.stream(messages, {
    resourceId: userId,
    threadId,
  });
  return stream.toDataStreamResponse();
}
