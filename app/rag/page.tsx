"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { DocumentUpload } from "./components/DocumentUpload";
import { NamespaceInput } from "./components/NamespaceInput";

export default function RAGChat() {
  const [namespace, setNamespace] = useState("default-namespace");

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
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
      isLoading={status === "streaming"}
      title="RAG with Pinecone"
      description="Chat with your documents using Retrieval-Augmented Generation. Upload documents to create a knowledge base, then ask questions about the content. By default, the changelog for NextJS 15 has been uploaded to the namespace 'default-namespace'."
      actions={actions}
    />
  );
}
