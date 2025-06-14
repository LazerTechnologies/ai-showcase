"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";

export default function AgenticRetrievalChat() {
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/agentic-retrieval",
    });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "streaming"}
      title="Agentic Retrieval"
      description="An agent that automatically chooses the best search method for your request. It can search Google Drive files by exact name/ID, perform keyword searches, or use real vector search with Pinecone to find semantically related content."
      setInput={setInput}
      samplePrompts={[
        "Find the file called 'Q4 Marketing Strategy'",
        "Show me the file with ID 1a2b3c4d",
        "What files discuss product development?",
      ]}
      isSingleAgent
    />
  );
}
