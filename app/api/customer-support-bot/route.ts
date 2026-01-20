import { RequestContext } from '@mastra/core/request-context';
import { customerSupportAgent } from "./agent";
import { CustomerSupportRuntimeContextSchema } from "./shared";
import { z } from "zod";
import { UserService } from "../../../services/user";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkStream } from "@mastra/ai-sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const requestContext = new RequestContext<
    z.infer<typeof CustomerSupportRuntimeContextSchema>
  >();
  const user = await UserService.createIfNotExists(userId);
  requestContext.set("userId", user.id);
  const stream = await customerSupportAgent.stream(messages, {
    memory: {
      resource: user.id,
      thread: threadId,
    },
    // TODO: Bug in Mastra typing, check in a future version
    requestContext: requestContext as RequestContext<unknown>,
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
