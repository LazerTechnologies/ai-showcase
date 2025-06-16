import { generalAgent } from "./general-agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, userId, threadId } = await req.json();

  const generalStream = await generalAgent.stream([message], {
    resourceId: userId,
    threadId,
  });

  return generalStream.toDataStreamResponse();
}
