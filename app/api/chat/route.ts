import { generalAgent } from "../../agents/general";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await generalAgent.stream(messages);
  return result.toDataStreamResponse();
}
