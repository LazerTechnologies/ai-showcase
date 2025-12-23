import { createRAGAgent } from "./agent";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, namespace } = await req.json();

  if (!namespace) {
    return new Response("Namespace is required", { status: 400 });
  }

  const ragAgent = createRAGAgent(namespace);
  const stream = await ragAgent.stream(messages);

  const uiMessageStream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(toAISdkFormat(stream, { from: 'agent' }));
    },
  });

  return createUIMessageStreamResponse({
    stream: uiMessageStream,
  });
}
