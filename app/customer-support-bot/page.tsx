"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { useState } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "support";

export default function CustomerSupportBotChat() {
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/customer-support-bot",
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
      title="Customer Support Bot"
      description="This customer support agent can create tickets, check status, and offer store credit if the user is very unhappy. Try telling the agent why you are unhappy with an order."
      samplePrompts={[
        "Hi, I need help with my order",
        "I got the wrong product",
      ]}
      setInput={setInput}
      isSingleAgent
    />
  );
}
