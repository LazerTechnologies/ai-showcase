import { RuntimeContext } from "@mastra/core/runtime-context";
import { customerSupportAgent } from "./agent";
import { CustomerSupportRuntimeContextSchema } from "./shared";
import { z } from "zod";
import { UserService } from "../../../services/user";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const runtimeContext = new RuntimeContext<
    z.infer<typeof CustomerSupportRuntimeContextSchema>
  >();
  const user = await UserService.createIfNotExists(userId);
  runtimeContext.set("userId", user.id);
  const stream = await customerSupportAgent.stream(messages, {
    memory: {
      resource: user.id,
      thread: threadId,
    },
    runtimeContext,
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
