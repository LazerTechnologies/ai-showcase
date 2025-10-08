"use client";

import { ChatInterface } from "@/app/components/chat";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { useState } from "react";
import { USER_ID_STORAGE_KEY } from "./constants/local-storage";

const THREAD_PREFIX = "general";

export default function GeneralChat() {
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
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
      title="General Chat"
      description="This model has its memory persisted to a database based on your user ID and thread ID. Try refreshing the page, and try changing your user ID and thread ID using the settings dropdown! It also auto-vectorizes your conversation for semantic recall beyond the context window. That means if the last 20 messages are always sent to the model, it'll also fetch an additional number of old messages that it thinks may be relevant."
      setInput={setInput}
      isSingleAgent
    />
  );
}
