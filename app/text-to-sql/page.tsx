"use client";

import { useChat } from "@ai-sdk/react";
import { ChatInterface } from "@/app/components/chat";
import { createPrepareRequestBody } from "@/app/utils/message-utils";
import { useThreadQuery } from "@/app/hooks/use-thread-query";
import { DatabaseSchemaDialog } from "./components/DatabaseSchemaDialog";

const THREAD_PREFIX = "text-to-sql";

export default function TextToSqlChat() {
  const { data: thread, isFetched } = useThreadQuery(THREAD_PREFIX);
  const { messages, input, handleInputChange, handleSubmit, setInput, status } =
    useChat({
      api: "/api/text-to-sql",
      experimental_prepareRequestBody: createPrepareRequestBody(THREAD_PREFIX),
      initialMessages: thread?.messages,
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
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={status === "streaming"}
      isResponseLoading={status === "submitted"}
      isLoadingInitialMessages={!isFetched}
      title="Text To SQL"
      description="Convert natural language queries into SQL statements. This agent can analyze database schemas, generate optimized queries, execute them against your databases, and provide intelligent summaries of the results."
      setInput={setInput}
      samplePrompts={["Show me all customers who made orders last month"]}
      actions={actions}
      isSingleAgent
    />
  );
}
