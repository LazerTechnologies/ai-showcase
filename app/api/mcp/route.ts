import { createMCPAgent } from "./agent";
import { UserService } from "../../../services/user";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const user = await UserService.createIfNotExists(userId);
  const mcpAgentInstance = await createMCPAgent();
  const stream = await mcpAgentInstance.stream(messages, {
    memory: {
      resource: user.id,
      thread: threadId,
    },
    format: "aisdk",
  });
  return stream.toUIMessageStreamResponse();
}
