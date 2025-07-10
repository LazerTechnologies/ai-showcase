"use server";

import { embedMany } from "ai";
import { MDocument } from "@mastra/rag";
import { PineconeVector } from "@mastra/pinecone";
import { PINECONE_INDEX_NAME } from "../../constants";
import { textEmbedding } from "../../utils/models";

export async function uploadDocument(namespace: string, document: string) {
  try {
    if (!document || !namespace) {
      throw new Error("Document and namespace are required");
    }

    // Create document from text
    const doc = MDocument.fromText(document);

    // Chunk the document
    const chunks = await doc.chunk({
      strategy: "markdown",
      size: 512,
      overlap: 50,
    });

    // Generate embeddings
    const { embeddings } = await embedMany({
      model: textEmbedding,
      values: chunks.map((chunk) => chunk.text),
    });

    // Initialize Pinecone store
    const store = new PineconeVector({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    // Upsert vectors to Pinecone
    await store.upsert({
      indexName: PINECONE_INDEX_NAME,
      namespace,
      vectors: embeddings,
      metadata: chunks.map((chunk, index) => ({
        text: chunk.text,
        chunkIndex: index,
        timestamp: new Date().toISOString(),
      })),
    });

    return {
      success: true,
      message: `Successfully processed ${chunks.length} chunks and uploaded to namespace "${namespace}"`,
      chunksCount: chunks.length,
    };
  } catch (error) {
    console.error("Error processing document:", error);
    return {
      success: false,
      error: "Failed to process document",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
