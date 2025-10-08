import { createUIMessageStream, createUIMessageStreamResponse, UIMessageStreamWriter  } from "ai";
import { delegateAgent } from "./delegate-agent";
import { coderAgent } from "./coder-agent";
import { z } from "zod";
import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core/agent";
import { makeSerializable } from "../../utils/serialization";
import { UserService } from "../../../services/user";

export const maxDuration = 30;

function createAgentTool(
  agent: Agent,
  streamId: string,
  description: string,
  writer: UIMessageStreamWriter
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
        writer.write({
          type: `data-test`,
          ...serializableChunk,
          data: {
            streamId,
          }
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
  const user = await UserService.createIfNotExists(userId);

  const stream = createUIMessageStream({
      execute: async ({ writer }) => {

        const coderTool = createAgentTool(
          coderAgent,
          "coder-agent",
          "Coder agent",
          writer
        );
  
        const delegateStream = await delegateAgent.stream(messages, {
          toolsets: {
            agents: {
              coder: coderTool,
            },
          },
          memory: {
            resource: user.id,
            thread: threadId,
          },
        });

        for await (const chunk of delegateStream.fullStream) {
          const serializableChunk = makeSerializable(chunk);
          console.log(chunk, serializableChunk)
          writer.write({
            type: `data-test-2`,
            ...serializableChunk,
            data: {
              streamId: "delegate-agent",
            }
          });
        }

      // writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
