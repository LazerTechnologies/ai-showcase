import { createDataStreamResponse } from "ai";
import { generalAgent } from "../../agents/general";
import { makeSerializable } from "../../utils/serialization";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Write initial data to identify stream
      dataStream.writeData({ type: "stream-start", streamId: "general-agent" });

      // Create the general agent stream
      const generalStream = await generalAgent.stream(messages);

      // Stream the general agent's chunks with general-agent streamId
      for await (const chunk of generalStream.fullStream) {
        const serializableChunk = makeSerializable(chunk);
        dataStream.writeData({
          streamId: "general-agent",
          ...serializableChunk,
        });
      }

      // Write completion signal
      dataStream.writeData({ type: "complete" });
    },
  });
}
