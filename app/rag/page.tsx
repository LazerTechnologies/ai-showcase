"use client";

import { useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { DocumentUpload } from "./components/DocumentUpload";
import { NamespaceInput } from "./components/NamespaceInput";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "rag";

export default function RAGChat() {
  const [namespace, setNamespace] = useState("default-namespace");
  const [input, setInput] = useState("");
  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/rag",
      // credentials: 'include',
      // headers: { 'Custom-Header': 'value' },
    }),
  });
  const { isFetched } = useThreadQuery(THREAD_PREFIX, (thread) => {
    if (thread?.messages) {
      setMessages(thread.messages);
    }
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
              namespace,
            },
          }
        );
      }}
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
