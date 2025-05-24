"use client";

import { useChat } from "@ai-sdk/react";
import { MessagesContainer } from "./MessagesContainer";
import { ChatInput } from "./ChatInput";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    onToolCall: (toolCall) => {
      console.log(toolCall);
    },
    onFinish: (message) => {
      console.log(message);
    },
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">Chat with your AI assistant</p>
      </div>

      <div className="flex flex-col flex-1 border rounded-lg overflow-hidden bg-background">
        <MessagesContainer messages={messages} />
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={status === "submitted" || status === "streaming"}
        />
      </div>
    </div>
  );
}
