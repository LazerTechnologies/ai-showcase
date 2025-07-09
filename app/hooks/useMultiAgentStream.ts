import { useState, useCallback, useMemo } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";
import { THREAD_ID_STORAGE_KEY } from "../constants/local-storage";
import { Message as UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";

/**
 * A wrapper around the UIMessage type that allows for a streamId to be added
 * to differentiate between messages from different agents.
 */
export interface MultiAgentUIMessage extends UIMessage {
  streamId?: string;
}

/**
 * As text delta chunks are streamed in, keep track of the full message
 */
interface StreamingTextDelta {
  streamStartedAt: number;
  text: string;
}

/**
 * The state of the chat: messages are messages that have been fully streamed,
 * and streamingMessages are messages that are still being streamed. Each agent
 * has maximum one streaming message at a time.
 */
interface ChatState {
  messages: MultiAgentUIMessage[];
  streamingMessages: Record<string, StreamingTextDelta>;
}

type UseChatStatus = ReturnType<typeof useChat>["status"];

export interface UseMultiAgentStreamReturn {
  messages: MultiAgentUIMessage[];
  input: string;
  setInput: (value: string) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: UseChatStatus;
}

/**
 * A hook that allows for multi-agent streaming. It's very similar to the useChat hook, but each chunk is simply
 * also provided with a streamId to differentiate between messages from different agents.
 *
 * @param apiEndpoint - The API endpoint to send requests to
 * @param threadPrefix - Prefix to add to the thread ID to ensure uniqueness per agent (in a real application, you would probably just have a fully unique thread ID for every conversation)
 * @param headers - Optional headers to include in requests
 */
export function useMultiAgentStream({
  apiEndpoint,
  threadPrefix,
  headers,
  initialMessages = [],
}: {
  apiEndpoint: string;
  threadPrefix: string;
  headers?: Record<string, string>;
  initialMessages?: MultiAgentUIMessage[];
}): UseMultiAgentStreamReturn {
  const [chatState, setChatState] = useState<ChatState>({
    messages: initialMessages,
    streamingMessages: {},
  });
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<UseChatStatus>("ready");

  const handleInputChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!input.trim() || status === "streaming") return;

      const userMessage: MultiAgentUIMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        parts: [{ type: "text", text: input.trim() }],
        createdAt: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));
      setInput("");
      setStatus("submitted");

      try {
        const baseThreadId = localStorage.getItem(THREAD_ID_STORAGE_KEY);
        const prefixedThreadId = baseThreadId
          ? `${threadPrefix}-${baseThreadId}`
          : null;

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            // We only send the last message to the API since Mastra handles message persistence rather than
            // maintaining the full conversation history locally. Map all messages if you want to store the full conversation history
            // locally (but make sure to remove memory usage from the agent).
            // See docs: https://mastra.ai/en/examples/memory/use-chat#preventing-message-duplication-with-usechat
            messages: [userMessage].map((msg) => ({
              role: msg.role,
              parts: msg.parts,
            })),
            userId:
              typeof window !== "undefined"
                ? localStorage.getItem(USER_ID_STORAGE_KEY) ?? undefined
                : undefined,
            threadId: prefixedThreadId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let hasStartedStreaming = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("2:")) {
              if (!hasStartedStreaming) {
                setStatus("streaming");
                hasStartedStreaming = true;
              }

              try {
                const jsonStr = line.slice(2);
                const dataArray = JSON.parse(jsonStr);

                for (const data of dataArray) {
                  switch (data.type) {
                    case "tool-call":
                      const toolMessage: MultiAgentUIMessage = {
                        id: `${Date.now()}-tool-${data.toolCallId}`,
                        role: "assistant",
                        content: `Using tool: ${data.toolName}`,
                        parts: [
                          {
                            type: "tool-invocation",
                            toolInvocation: {
                              toolCallId: data.toolCallId,
                              toolName: data.toolName,
                              args: data.args || {},
                              state: "call",
                            },
                          },
                        ],
                        createdAt: new Date(),
                        streamId: data.streamId,
                      };
                      setChatState((prev) => ({
                        ...prev,
                        messages: [...prev.messages, toolMessage],
                      }));
                      break;

                    case "text-delta":
                      if (data.streamId) {
                        setChatState((prev) => {
                          const existing =
                            prev.streamingMessages[data.streamId];
                          if (existing) {
                            return {
                              ...prev,
                              streamingMessages: {
                                ...prev.streamingMessages,
                                [data.streamId]: {
                                  ...existing,
                                  text: existing.text + (data.textDelta || ""),
                                },
                              },
                            };
                          } else {
                            return {
                              ...prev,
                              streamingMessages: {
                                ...prev.streamingMessages,
                                [data.streamId]: {
                                  streamStartedAt: Date.now(),
                                  text: data.textDelta || "",
                                },
                              },
                            };
                          }
                        });
                      }
                      break;

                    case "finish":
                      setChatState((prev) => {
                        const streamingMessage =
                          prev.streamingMessages[data.streamId];
                        if (streamingMessage) {
                          const completedMessage: MultiAgentUIMessage = {
                            id: `${Date.now()}-${data.streamId}`,
                            role: "assistant",
                            content: streamingMessage.text,
                            parts: [
                              { type: "text", text: streamingMessage.text },
                            ],
                            createdAt: new Date(
                              streamingMessage.streamStartedAt
                            ),
                            streamId: data.streamId,
                          };

                          const newStreamingMessages = {
                            ...prev.streamingMessages,
                          };
                          delete newStreamingMessages[data.streamId];

                          return {
                            messages: [...prev.messages, completedMessage],
                            streamingMessages: newStreamingMessages,
                          };
                        }
                        return prev;
                      });
                      break;

                    case "step-start":
                    case "step-finish":
                    case "tool-result":
                      break;

                    default:
                      throw new Error(
                        `Unknown data type: ${data.type}: ${JSON.stringify(
                          data
                        )}`
                      );
                  }
                }
              } catch (error) {
                console.error("Error parsing stream data:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in chat stream:", error);
        setStatus("error");
        const errorMessage: MultiAgentUIMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          parts: [
            {
              type: "text",
              text: "Sorry, there was an error processing your request.",
            },
          ],
          createdAt: new Date(),
        };
        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }));
      } finally {
        setStatus("ready");
      }
    },
    [input, status, apiEndpoint, threadPrefix, headers]
  );

  // Combine messages and streaming messages, sorted by timestamp/streamStartedAt
  const allMessages = useMemo(() => {
    const streamingMessages: MultiAgentUIMessage[] = Object.entries(
      chatState.streamingMessages
    )
      .filter(([, streamMsg]) => streamMsg !== undefined)
      .map(([streamId, streamMsg]) => ({
        id: `streaming-${streamId}`,
        role: "assistant" as const,
        content: streamMsg!.text,
        parts: [{ type: "text", text: streamMsg!.text }],
        createdAt: new Date(streamMsg!.streamStartedAt),
        streamId,
      }));

    return [...chatState.messages, ...streamingMessages].sort(
      (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
    );
  }, [chatState.messages, chatState.streamingMessages]);

  return {
    messages: allMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    status,
  };
}
