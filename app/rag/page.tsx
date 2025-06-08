"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { DocumentUpload } from "./components/DocumentUpload";
import { NamespaceInput } from "./components/NamespaceInput";

export default function RAGChat() {
  const [namespace, setNamespace] = useState("default-namespace");

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/rag",
      body: { namespace },
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
      isLoading={isLoading}
      title="RAG with Pinecone"
      description="Chat with your documents using Retrieval-Augmented Generation. Upload documents to create a knowledge base, then ask questions about the content. The system will chunk your documents, generate embeddings, and store them in Pinecone for semantic search."
      actions={actions}
    />
  );
}
