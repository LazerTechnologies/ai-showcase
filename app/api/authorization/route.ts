import { createAuthorizationAgent } from "./agent";
import { UserService } from "../../../services/user";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId, role } = await req.json();
  const user = await UserService.createIfNotExists(userId);

  // Get the user role from request body
  // In a real-world application, this would be a JWT token or other authentication mechanism
  const userRole = (role as "viewer" | "admin") || "viewer";

  // Create the agent based on the user role
  const authorizationAgent = createAuthorizationAgent(userRole);

  const stream = await authorizationAgent.stream(messages, {
    memory: {
      resource: user.id,
      thread: threadId,
    },
  });

  const uiMessageStream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(toAISdkStream(stream, { from: 'agent' }));
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
