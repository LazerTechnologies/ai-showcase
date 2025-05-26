"use client";

import { useDataStream } from "@/app/hooks/useDataStream";
import { ChatInterface } from "@/app/components/chat";

export default function GeneralChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useDataStream("/api/chat");

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      title="General Chat"
      description="A versatile AI assistant ready to help with any questions, tasks, or conversations you have in mind."
    />
  );
}
