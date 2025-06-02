"use client";

import { useDataStream } from "@/app/hooks/useDataStream";
import { ChatInterface } from "@/app/components/chat";
import { SetUserId } from "./components/chat/actions/SetUserId";
import { SetThreadId } from "./components/chat/actions/SetThreadId";

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
      description="This model has its memory persisted to a database based on your user ID and thread ID. Try refreshing the page, and try changing your user ID and thread ID using the settings dropdown! It also auto-vectorizes your conversation for semantic recall beyond the context window. That means if the last 20 messages are always sent to the model, it'll also fetch an additional number of old messages that it thinks may be relevant."
      actions={
        <div className="flex flex-col gap-2">
          <SetUserId />
          <SetThreadId />
        </div>
      }
    />
  );
}
