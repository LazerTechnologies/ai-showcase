import { z } from "zod";

export const CustomerSupportRuntimeContextSchema = z.object({
  userId: z.string(),
});

// This shouldn't be necessary since Mastra claims that
// the runtime context is type-safe, but it doesn't
// seem to be the case.
export function validateRuntimeContext(runtimeContext: {
  get: (key: string) => unknown;
}): z.infer<typeof CustomerSupportRuntimeContextSchema> {
  const userId = runtimeContext.get("userId");

  const result = CustomerSupportRuntimeContextSchema.safeParse({ userId });

  if (!result.success) {
    throw new Error(`Invalid runtime context: ${result.error.message}`);
  }

  return result.data;
}
