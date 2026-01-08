import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.LAZER_FOCUS_API_KEY!,
  baseURL: "https://llm.lazertechnologies.com/v1",
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const flash = openai.chat("groq/openai/gpt-oss-120b");
export const textEmbedding = google.textEmbeddingModel("text-embedding-004");
export const textEmbeddingProviderOptions = {
  google: {
    outputDimensionality: 384,
    taskType: "SEMANTIC_SIMILARITY" as const,
  },
};