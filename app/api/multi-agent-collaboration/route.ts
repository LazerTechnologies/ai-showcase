import { createDataStreamResponse } from "ai";
import { delegateAgent } from "../../agents/delegate";
import { coderAgent } from "../../agents/coder";
import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { makeSerializable } from "../../utils/serialization";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const coderTool = createTool({
        id: "coder-agent",
        description: "Calls the coder agent to write code.",
        inputSchema: z.object({
          prompt: z.string().describe("The prompt to the coder agent"),
        }),
        outputSchema: z.object({
          output: z.string().describe("The coder agent's response"),
        }),
        execute: async ({ context }) => {
          console.log("starting");
          const coderStream = await coderAgent.stream(context.prompt, {
            onStepFinish: (step) => {
              console.log("step", step);
            },
            onFinish: (message) => {
              console.log("message", message);
            },
          });

          let finalText = "";

          // Stream the coder agent's chunks with coder-agent streamId
          for await (const chunk of coderStream.fullStream) {
            const serializableChunk = makeSerializable(chunk);
            dataStream.writeData({
              streamId: "coder-agent",
              ...serializableChunk,
            });
          }

          // Collect the final text from the text stream
          for await (const textChunk of coderStream.textStream) {
            finalText += textChunk;
          }

          return { output: finalText };
        },
      });

      // Create the general agent stream with the coder tool
      const delegateStream = await delegateAgent.stream(messages, {
        toolsets: {
          agents: {
            coder: coderTool,
          },
        },
      });

      // Stream the general agent's chunks with general-agent streamId
      for await (const chunk of delegateStream.fullStream) {
        const serializableChunk = makeSerializable(chunk);
        dataStream.writeData({
          streamId: "delegate-agent",
          ...serializableChunk,
        });
      }
    },
  });
}
