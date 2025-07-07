import { RuntimeContext } from "@mastra/core/runtime-context";
import { customerSupportAgent } from "./agent";

export const maxDuration = 30;

type CustomerSupportRuntimeContext = {
  userId: string;
};

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();

  const runtimeContext = new RuntimeContext<CustomerSupportRuntimeContext>();
  runtimeContext.set("userId", userId);
  const stream = await customerSupportAgent.stream(messages, {
    resourceId: userId,
    threadId,
    runtimeContext,
  });

  return stream.toDataStreamResponse();
}
