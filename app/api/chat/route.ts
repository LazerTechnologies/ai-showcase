import { generalAgent } from "./general-agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();

  const generalStream = await generalAgent.stream(messages, {
    resourceId: userId,
    threadId,
  });

  return generalStream.toDataStreamResponse();
}
