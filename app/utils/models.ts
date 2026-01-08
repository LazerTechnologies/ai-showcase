import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const flash = groq("openai/gpt-oss-20b");
export const textEmbedding = google.textEmbeddingModel("text-embedding-004");
export const textEmbeddingProviderOptions = {
  google: {
    outputDimensionality: 384,
    taskType: "SEMANTIC_SIMILARITY" as const,
  },
};