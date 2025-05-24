"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";

export default function GeneralChat() {
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
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "submitted" || status === "streaming"}
    />
  );
}
