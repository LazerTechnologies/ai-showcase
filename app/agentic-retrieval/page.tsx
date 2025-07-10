"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { createPrepareRequestBody } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";

const THREAD_PREFIX = "agentic-retrieval";

export default function AgenticRetrievalChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/agentic-retrieval",
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
      title="Agentic Retrieval"
      description="An agent that automatically chooses the best search method for your request. It can search Google Drive files by exact name/ID, perform keyword searches, or use real vector search with Pinecone to find semantically related content."
      setInput={setInput}
      samplePrompts={[
        "Find the file called 'Q4 Marketing Strategy'",
        "What files discuss product development?",
      ]}
      isSingleAgent
    />
  );
}
