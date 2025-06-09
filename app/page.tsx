"use client";

import { useDataStream } from "@/app/hooks/useDataStream";
import { ChatInterface } from "@/app/components/chat";

export default function GeneralChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useDataStream("/api/chat");

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      title="General Chat"
      description="This model has its memory persisted to a database based on your user ID and thread ID. Try refreshing the page, and try changing your user ID and thread ID using the settings dropdown! It also auto-vectorizes your conversation for semantic recall beyond the context window. That means if the last 20 messages are always sent to the model, it'll also fetch an additional number of old messages that it thinks may be relevant."
      setInput={setInput}
    />
  );
}
