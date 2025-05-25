"use client";

import { useDataStream } from "@/app/hooks/useDataStream";
import { ChatInterface } from "@/app/components/chat";

export default function GeneralChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useDataStream("/api/multi-agent-collaboration");

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
