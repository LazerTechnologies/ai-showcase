import { RuntimeContext } from "@mastra/core/runtime-context";
import { customerSupportAgent } from "./agent";
import { CustomerSupportRuntimeContextSchema } from "./shared";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();

  const runtimeContext = new RuntimeContext<
    z.infer<typeof CustomerSupportRuntimeContextSchema>
  >();
  runtimeContext.set("userId", userId);
  console.log("threadId", threadId);
  const stream = await customerSupportAgent.stream(messages, {
    resourceId: userId,
    threadId,
    runtimeContext,
  });

  return stream.toDataStreamResponse();
}
