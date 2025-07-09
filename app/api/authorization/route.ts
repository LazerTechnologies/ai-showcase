import { createDataStreamResponse } from "ai";
import { createAuthorizationAgent } from "./agent";
import { makeSerializable } from "../../utils/serialization";
import { UserService } from "../../../services/user";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const user = await UserService.createIfNotExists(userId);

  // Get the user role from headers
  // In a real-world application, this would be a JWT token or other authentication mechanism
  const userRole =
    (req.headers.get("x-user-role") as "viewer" | "admin") || "viewer";

  // Create the agent based on the user role
  const authorizationAgent = createAuthorizationAgent(userRole);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const agentStream = await authorizationAgent.stream(messages, {
        resourceId: user.id,
        threadId,
      });

      for await (const chunk of agentStream.fullStream) {
        const serializableChunk = makeSerializable(chunk);
        dataStream.writeData({
          streamId: "authorization-agent",
          ...serializableChunk,
        });
      }
    },
  });
}
