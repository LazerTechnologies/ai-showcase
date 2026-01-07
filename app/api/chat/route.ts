import { generalAgent } from "./general-agent";
import { UserService } from "../../../services/user";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const user = await UserService.createIfNotExists(userId);

  const generalStream = await generalAgent.stream(messages, {
    memory: {
      resource: user.id,
      thread: threadId,
    },
  });

  const uiMessageStream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(toAISdkStream(generalStream, { from: 'agent' }));
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
