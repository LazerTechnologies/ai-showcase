"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { useState } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "agentic-retrieval";

export default function AgenticRetrievalChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    messages: thread?.messages ?? [],
    transport: new DefaultChatTransport({
      api: "/api/agentic-retrieval",
      // credentials: 'include',
      // headers: { 'Custom-Header': 'value' },
    }),
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
