"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { createPrepareRequestBody } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";

const THREAD_PREFIX = "support";

export default function CustomerSupportBotChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/customer-support-bot",
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
