import { useState, useCallback } from "react";

export interface StreamMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streamId?: string;
  timestamp: number;
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

export function useDataStream(apiEndpoint: string): UseDataStreamReturn {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
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
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
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
        const assistantMessages = new Map<string, StreamMessage>();

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

                // Data is always an array
                for (const data of dataArray) {
                  if (data.type === "stream-start") {
                    // Initialize a new assistant message for this stream
                    const assistantMessage: StreamMessage = {
                      id: `${Date.now()}-${data.streamId}`,
                      role: "assistant",
                      content: "",
                      streamId: data.streamId,
                      timestamp: Date.now(),
                    };
                    assistantMessages.set(data.streamId, assistantMessage);
                  } else if (data.streamId && data.type === "text-delta") {
                    // Update the content for this stream
                    const existingMessage = assistantMessages.get(
                      data.streamId
                    );
                    if (existingMessage) {
                      existingMessage.content += data.textDelta || "";
                      assistantMessages.set(data.streamId, {
                        ...existingMessage,
                      });
                    }
                  } else if (data.type === "complete") {
                    // Finalize all messages
                    setMessages((prev) => [
                      ...prev,
                      ...Array.from(assistantMessages.values()),
                    ]);
                  }
                }

                // Update messages in real-time during streaming
                if (assistantMessages.size > 0) {
                  setMessages((prev) => [
                    ...prev.filter(
                      (msg) =>
                        msg.role === "user" ||
                        !assistantMessages.has(msg.streamId || "")
                    ),
                    ...Array.from(assistantMessages.values()),
                  ]);
                }
              } catch (error) {
                console.error("Error parsing stream data:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in chat stream:", error);
        // Add error message
        const errorMessage: StreamMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, apiEndpoint]
  );

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
}
