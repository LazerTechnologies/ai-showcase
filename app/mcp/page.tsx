"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { createPrepareRequestBody } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";

const THREAD_PREFIX = "mcp";

export default function MCPPage() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);

  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/mcp",
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
      title="MCP"
      description="This agent is set up to use the Context7 MCP server. Try asking it for how to use your favourite database ORM."
      setInput={setInput}
      isSingleAgent
      samplePrompts={["How do I do an inner join in Prisma?"]}
    />
  );
}
