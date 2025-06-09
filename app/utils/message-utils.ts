import { Message as UIMessage } from "ai";

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
