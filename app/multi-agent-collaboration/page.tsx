"use client";

import { ChatInterface } from "@/app/components/chat";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { useState } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "multi-agent";

export default function MultiAgentChat() {
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/multi-agent-collaboration",
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
      title="Multi-Agent Collaboration"
      description="Watch multiple AI agents work together in real-time, coordinating their responses and building on each other's insights to solve complex problems. In this particular example, try asking this chat to write some TypeScript code for you and see how the agent coordinates with a coder agent to do so."
      setInput={setInput}
      samplePrompts={[
        "Write a TypeScript function that calculates the Fibonacci sequence up to a given number.",
      ]}
    />
  );
}
