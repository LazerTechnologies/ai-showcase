"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { useState } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "mcp";

export default function MCPPage() {
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/mcp",
      // credentials: 'include',
      // headers: { 'Custom-Header': 'value' },
    }),
  });
  const { isFetched } = useThreadQuery(THREAD_PREFIX, (thread) => {
    if (thread?.messages) {
      setMessages(thread.messages);
    }
  });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={(e) => setInput(e.target.value)}
      handleSubmit={(e) => {
        e.preventDefault();
        sendMessage(
          {
            text: input,
          },
          {
            body: {
              threadId: getPrefixedThreadId(THREAD_PREFIX),
              userId: localStorage.getItem(USER_ID_STORAGE_KEY),
            },
          }
        );
      }}
      isLoading={status === "streaming"}
      isResponseLoading={status === "submitted"}
      isLoadingInitialMessages={!isFetched}
      title="MCP"
      description="This agent is set up to use the Context7 MCP server. Try asking it for how to use your favourite database ORM."
      setInput={setInput}
      isSingleAgent
      samplePrompts={["How do I do an inner join in Prisma?"]}
    />
  );
}
