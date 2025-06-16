"use client";

import { Message as UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  THREAD_ID_STORAGE_KEY,
  USER_ID_STORAGE_KEY,
} from "../constants/local-storage";

// Extract the type of the request parameter from useChat's experimental_prepareRequestBody
type PrepareRequestBodyRequest = Parameters<
  NonNullable<
    NonNullable<
      Parameters<typeof useChat>[0]
    >["experimental_prepareRequestBody"]
  >
>[0];

/**
 * Shared experimental_prepareRequestBody function for useChat
 * This sends only the last message to the API since Mastra handles message persistence rather than
 * maintaining the full conversation history locally.
 * See docs: https://mastra.ai/en/examples/memory/use-chat#preventing-message-duplication-with-usechat
 *
 * @param threadPrefix - Prefix to add to the thread ID to ensure uniqueness per agent (in a real application, you would probably just have a fully unique thread ID for every conversation)
 */
export function createPrepareRequestBody(threadPrefix: string) {
  return (request: PrepareRequestBodyRequest) => {
    const lastMessage =
      request.messages.length > 0
        ? request.messages[request.messages.length - 1]
        : null;

    const baseThreadId = localStorage.getItem(THREAD_ID_STORAGE_KEY);
    const prefixedThreadId = baseThreadId
      ? `${threadPrefix}-${baseThreadId}`
      : null;

    return {
      messages: lastMessage ? [lastMessage] : [],
      threadId: prefixedThreadId,
      userId: localStorage.getItem(USER_ID_STORAGE_KEY),
    };
  };
}

/**
 * Converts parts array to content string
 */
export function partsToString(parts: UIMessage["parts"]): string {
  if (!parts || parts.length === 0) return "";

  return parts
    .map((part) => {
      if (typeof part !== "object" || part === null || !("type" in part)) {
        return "";
      }

      const typedPart = part as { type: string; [key: string]: unknown };

      switch (typedPart.type) {
        case "text":
          return (typedPart as unknown as { text: string }).text || "";
        case "reasoning":
          return (
            (typedPart as unknown as { reasoning: string }).reasoning || ""
          );
        case "tool-invocation":
          const toolInvocation = typedPart.toolInvocation as unknown;
          if (
            toolInvocation &&
            typeof toolInvocation === "object" &&
            "toolName" in toolInvocation
          ) {
            return `Using tool: ${
              (toolInvocation as { toolName: string }).toolName
            }`;
          }
          return `Tool: ${JSON.stringify(typedPart.toolInvocation)}`;
        case "source":
          return `Source: ${JSON.stringify(typedPart.source)}`;
        case "file":
          return `File: ${
            (typedPart as unknown as { mimeType: string }).mimeType
          }`;
        // case "step-start":
        //   return "--- Step Start ---";
        default:
          return "";
      }
    })
    .join("\n");
}
