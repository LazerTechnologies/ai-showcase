import { useState, useCallback, useMemo } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";
import { THREAD_ID_STORAGE_KEY } from "../constants/local-storage";
import { Message as UIMessage } from "ai";

export interface StreamMessage extends UIMessage {
  streamId?: string;
}

interface StreamingMessage {
  streamStartedAt: number;
  text: string;
}

interface ChatState {
  messages: StreamMessage[];
  streamingMessages: Record<string, StreamingMessage>;
}

export interface UseDataStreamReturn {
  messages: StreamMessage[];
  input: string;
  setInput: (value: string) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function useDataStream(
  apiEndpoint: string,
  headers?: Record<string, string>
): UseDataStreamReturn {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    streamingMessages: {},
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      if (!input.trim() || isLoading) return;

      const userMessage: StreamMessage = {
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
      setIsLoading(true);

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            messages: [...chatState.messages, userMessage].map((msg) => ({
              role: msg.role,
              parts: msg.parts,
            })),
            userId:
              typeof window !== "undefined"
                ? localStorage.getItem(USER_ID_STORAGE_KEY) ?? undefined
                : undefined,
            threadId:
              typeof window !== "undefined"
                ? localStorage.getItem(THREAD_ID_STORAGE_KEY) ?? undefined
                : undefined,
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("2:")) {
              try {
                const jsonStr = line.slice(2);
                const dataArray = JSON.parse(jsonStr);

                for (const data of dataArray) {
                  switch (data.type) {
                    case "tool-call":
                      const toolMessage: StreamMessage = {
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
                          const completedMessage: StreamMessage = {
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
        const errorMessage: StreamMessage = {
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
        setIsLoading(false);
      }
    },
    [input, isLoading, chatState.messages, apiEndpoint, headers]
  );

  // Combine messages and streaming messages, sorted by timestamp/streamStartedAt
  const allMessages = useMemo(() => {
    const streamingMessages: StreamMessage[] = Object.entries(
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
    isLoading,
  };
}
