import { generalAgent } from "./general-agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  // const user = await UserService.createIfNotExists(userId);

  const generalStream = await generalAgent.stream(messages, {});

  return generalStream.toDataStreamResponse();
}
