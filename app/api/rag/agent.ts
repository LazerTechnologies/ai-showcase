import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { PineconeVector } from "@mastra/pinecone";
import { embed } from "ai";
import { fastembed } from "@mastra/fastembed";
import { z } from "zod";
import { PINECONE_INDEX_NAME } from "../../constants";
import { flash } from "../../utils/models";

function createCustomVectorSearchTool(namespace: string) {
  const store = new PineconeVector({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return createTool({
    id: "searchKnowledgeBase",
    description:
      "Search the knowledge base for information that may be relevant to the user's question",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query to find relevant information. If the user has not provided a specific query, you can come up with one yourself."
        ),
      topK: z
        .number()
        .optional()
        .default(5)
        .describe("Number of results to return"),
    }),
    execute: async ({ context }) => {
      const { query, topK } = context;
      try {
        // Generate embedding for the query text using the same model used for document chunks
        const { embedding: queryVector } = await embed({
          model: fastembed,
          value: query,
        });

        // Perform actual vector search using the Pinecone store
        const searchResults = await store.query({
          indexName: PINECONE_INDEX_NAME,
          queryVector,
          topK,
          namespace,
        });

        // Transform the results to match the expected format
        const results = searchResults.map((result) => ({
          content: result.metadata?.text || result.metadata?.content || "",
          score: result.score || 0,
          source: result.metadata?.source || result.id || "unknown",
          id: result.id,
          metadata: result.metadata,
        }));

        return {
          results,
          query,
          totalResults: results.length,
          namespace,
          indexName: PINECONE_INDEX_NAME,
        };
      } catch (error) {
        console.error("Error in vector search:", error);
        throw new Error(
          `Failed to search knowledge base: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  });
}

export function createRAGAgent(namespace: string) {
  const vectorSearchTool = createCustomVectorSearchTool(namespace);

  return new Agent({
    name: "rag-agent",
    instructions: `You are a RAG (Retrieval-Augmented Generation) agent. You have access to a knowledge base stored in a Pinecone vector database with index name "${PINECONE_INDEX_NAME}" and namespace "${namespace}". 

When answering questions:
1. Use the searchKnowledgeBase tool to retrieve relevant context from the knowledge base
2. If the user asks a question but doesn't explicitly ask for you to query the knowledge base, still do so.
2. Use the retrieved context to provide accurate, relevant answers
3. If the retrieved context doesn't contain enough information to answer the question, say so clearly
4. Always cite or reference the source material when possible
5. Be concise but comprehensive in your responses

The knowledge base contains documents that have been chunked and embedded for semantic search.`,
    model: flash,
    tools: {
      searchKnowledgeBase: vectorSearchTool,
    },
  });
}
