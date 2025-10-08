"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { getPrefixedThreadId } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { DatabaseSchemaDialog } from "./components/DatabaseSchemaDialog";
import { useState } from "react";
import { USER_ID_STORAGE_KEY } from "../constants/local-storage";

const THREAD_PREFIX = "text-to-sql";

export default function TextToSqlChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    messages: thread?.messages ?? [],
    transport: new DefaultChatTransport({
      api: "/api/text-to-sql",
      // credentials: 'include',
      // headers: { 'Custom-Header': 'value' },
    }),
  });

  const actions = (
    <div className="space-y-4">
      <DatabaseSchemaDialog />
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
            },
          }
        );
      }}
      isLoading={status === "streaming"}
      isResponseLoading={status === "submitted"}
      isLoadingInitialMessages={!isFetched}
      title="Text To SQL"
      description="Convert natural language queries into SQL statements. This agent can analyze database schemas, generate optimized queries, execute them against your databases, and provide intelligent summaries of the results."
      setInput={setInput}
      samplePrompts={["Fetch all store credits over $30"]}
      actions={actions}
      isSingleAgent
    />
  );
}
