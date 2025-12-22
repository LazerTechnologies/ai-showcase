"use client";

import { UIMessage } from "ai";
import {
  THREAD_ID_STORAGE_KEY,
} from "../constants/local-storage";
import type { AgentDataPart } from "@mastra/ai-sdk";

/**
 * Gets the thread ID from local storage and prefixes it.
 * @param threadPrefix - The prefix for the thread ID.
 * @returns The prefixed thread ID or null if not found.
 */
export function getPrefixedThreadId(threadPrefix: string): string | null {
  const baseThreadId =
    typeof window !== "undefined"
      ? localStorage.getItem(THREAD_ID_STORAGE_KEY)
      : null;
  if (!baseThreadId) {
    return null;
  }
  return `${threadPrefix}-${baseThreadId}`;
}

/**
 * Type guard to check if a part is a tool agent part with an id
 */
export function isToolAgentPart(
  part: UIMessage["parts"][number]
): part is AgentDataPart & { data: { id: string } } {
  return part.type === "data-tool-agent";
}

/**
 * Extracts the streamId from a message's first part if it's a tool agent part
 */
export function getStreamIdFromMessage(message: UIMessage): string | undefined {
  const part = message.parts?.[0];
  return part && isToolAgentPart(part) ? part.data.id : undefined;
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

      if (typedPart.type.startsWith("tool-")) {
        const toolToStringify = {
          type: typedPart.type.split("tool-")[1],
          input: typedPart.input,
        }
        return `Tool: ${JSON.stringify(toolToStringify)}`;
      }

      switch (typedPart.type) {
        case "text":
          return (typedPart as unknown as { text: string }).text || "";
        case "reasoning":
          return (
            (typedPart as unknown as { reasoning: string }).reasoning || ""
          );
        case "source":
          return `Source: ${JSON.stringify(typedPart.source)}`;
        case "data-tool-agent":
          return `Tool Agent: ${JSON.stringify(typedPart.data)}`;
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
