"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { DocumentUpload } from "./components/DocumentUpload";
import { NamespaceInput } from "./components/NamespaceInput";
import { createPrepareRequestBody } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";

const THREAD_PREFIX = "rag";

export default function RAGChat() {
  const [namespace, setNamespace] = useState("default-namespace");
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);

  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/rag",
      experimental_prepareRequestBody: createPrepareRequestBody(THREAD_PREFIX, {
        namespace,
      }),
      initialMessages: thread?.messages,
    });

  const actions = (
    <div className="space-y-6">
      <NamespaceInput namespace={namespace} onNamespaceChange={setNamespace} />
      <DocumentUpload namespace={namespace} />
    </div>
  );

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "streaming"}
      isResponseLoading={status === "submitted"}
      isLoadingInitialMessages={!isFetched}
      title="RAG with Pinecone"
      description="Chat with your documents using Retrieval-Augmented Generation. Upload documents to create a knowledge base, then ask questions about the content. By default, the changelog for NextJS 15 has been uploaded to the namespace 'default-namespace'."
      actions={actions}
      samplePrompts={[
        "What's new in NextJS 15?",
        "What experimental features are available in NextJS 15?",
      ]}
      setInput={setInput}
      isSingleAgent
    />
  );
}
