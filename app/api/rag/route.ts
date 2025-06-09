import { createRAGAgent } from "./agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, namespace } = await req.json();

  if (!namespace) {
    return new Response("Namespace is required", { status: 400 });
  }

  const ragAgent = createRAGAgent(namespace);
  const stream = await ragAgent.stream(messages, {
    toolCallStreaming: true,
  });
  return stream.toDataStreamResponse();
}
