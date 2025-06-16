"use client";

import { ChatInterface } from "@/app/components/chat";
import { useChat } from "@ai-sdk/react";
import {
  THREAD_ID_STORAGE_KEY,
  USER_ID_STORAGE_KEY,
} from "./constants/local-storage";

export default function GeneralChat() {
  const { messages, input, handleInputChange, handleSubmit, status, setInput } =
    useChat({
      api: "/api/chat",
      experimental_prepareRequestBody: (request) => {
        // useChat sends all messages to the API, but we only want to send the last message since Mastra
        // is handling message persistence for us.
        // See docs: https://mastra.ai/en/examples/memory/use-chat#preventing-message-duplication-with-usechat
        const lastMessage =
          request.messages.length > 0
            ? request.messages[request.messages.length - 1]
            : null;

        return {
          message: lastMessage,
          threadId: localStorage.getItem(THREAD_ID_STORAGE_KEY),
          userId: localStorage.getItem(USER_ID_STORAGE_KEY),
        };
      },
    });

  return (
    <ChatInterface
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "streaming"}
      title="General Chat"
      description="This model has its memory persisted to a database based on your user ID and thread ID. Try refreshing the page, and try changing your user ID and thread ID using the settings dropdown! It also auto-vectorizes your conversation for semantic recall beyond the context window. That means if the last 20 messages are always sent to the model, it'll also fetch an additional number of old messages that it thinks may be relevant."
      setInput={setInput}
      isSingleAgent
    />
  );
}
