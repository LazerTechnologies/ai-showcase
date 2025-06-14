import { customerSupportAgent } from "./agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();

  const stream = await customerSupportAgent.stream(messages, {
    resourceId: userId,
    threadId,
  });

  return stream.toDataStreamResponse();
}
