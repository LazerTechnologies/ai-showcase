"use client";

import { ChatInterface } from "@/app/components/chat";
import { useChat } from "@ai-sdk/react";
import { createPrepareRequestBody } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";

const THREAD_PREFIX = "general";

export default function GeneralChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const { messages, input, handleInputChange, handleSubmit, status, setInput } =
    useChat({
      api: "/api/chat",
      experimental_prepareRequestBody: createPrepareRequestBody(THREAD_PREFIX),
      initialMessages: thread?.messages,
    });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
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
