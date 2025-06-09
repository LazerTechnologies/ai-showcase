import { createDataStreamResponse } from "ai";
import { generalAgent } from "../../agents/general";
import { makeSerializable } from "../../utils/serialization";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const generalStream = await generalAgent.stream(messages, {
        resourceId: userId,
        threadId,
      });

      for await (const chunk of generalStream.fullStream) {
        const serializableChunk = makeSerializable(chunk);
        dataStream.writeData({
          streamId: "general-agent",
          ...serializableChunk,
        });
      }
    },
  });
}
