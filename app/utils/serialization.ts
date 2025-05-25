// Helper function to filter out non-JSON serializable properties
export function makeSerializable(chunk: unknown): Record<string, unknown> {
  if (typeof chunk !== "object" || chunk === null) {
    return {};
  }

  const obj = chunk as Record<string, unknown>;
  const serializable: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip Uint8Array and other non-serializable types
    if (value instanceof Uint8Array || typeof value === "function") {
      continue;
    }
    serializable[key] = value;
  }

  return serializable;
}
