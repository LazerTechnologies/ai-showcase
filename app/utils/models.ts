import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const flash = google("gemini-2.5-flash");
export const textEmbedding = google.textEmbeddingModel("text-embedding-004", {
  outputDimensionality: 384,
});
