import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { wrapProvider } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Currently, the Memory embedder prop only accepts a model, not providerOptions, so this is
// a workaround to set the output dimensionality until there's a native option
const textEmbeddingGoogle = wrapProvider({
  provider: google,
  languageModelMiddleware: {
    transformParams: async ({ params }) => {
      params.providerOptions = {
        google: {
          outputDimensionality: 384,
          taskType: "SEMANTIC_SIMILARITY"
        }
      };
      return params;
    },
  }
});

export const flash = groq("openai/gpt-oss-20b");
export const textEmbedding = textEmbeddingGoogle.textEmbeddingModel("text-embedding-004");