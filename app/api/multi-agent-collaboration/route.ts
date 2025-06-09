import { createDataStreamResponse, type JSONValue } from "ai";
import { delegateAgent } from "../../agents/delegate";
import { coderAgent } from "../../agents/coder";
import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core/agent";
import { makeSerializable } from "../../utils/serialization";

interface DataStream {
  writeData: (value: JSONValue) => void;
}

function createAgentTool(
  agent: Agent,
  streamId: string,
  description: string,
  dataStream: DataStream
) {
  return createTool({
    id: streamId,
    description,
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to the agent"),
    }),
    outputSchema: z.object({
      output: z.string().describe("The agent's response"),
    }),
    execute: async ({ context }) => {
      const agentStream = await agent.stream(context.prompt);

      let finalText = "";

      for await (const chunk of agentStream.fullStream) {
        const serializableChunk = makeSerializable(chunk);
        dataStream.writeData({
          streamId,
          ...serializableChunk,
        });
      }

      for await (const textChunk of agentStream.textStream) {
        finalText += textChunk;
      }

      return { output: finalText };
    },
  });
}

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const coderTool = createAgentTool(
        coderAgent,
        "coder-agent",
        "Coder agent",
        dataStream
      );

      const delegateStream = await delegateAgent.stream(messages, {
        toolsets: {
          agents: {
            coder: coderTool,
          },
        },
        resourceId: userId,
        threadId,
      });

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
