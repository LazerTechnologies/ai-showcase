import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { PineconeVector } from "@mastra/pinecone";
import { embed } from "ai";
import { PINECONE_INDEX_NAME } from "../../constants";
import { threadMemory } from "../memory";
import { flash, textEmbedding } from "../../utils/models";
import { UserService } from "../../../services/user";

interface DriveFile {
  id: string;
  name: string;
  content: string;
  type: "document" | "spreadsheet" | "presentation" | "folder";
  tags: string[];
  createdAt: string;
  modifiedAt: string;
  owner: string;
}

const mockDriveFiles: DriveFile[] = [
  {
    id: "1a2b3c4d",
    name: "Q4 Marketing Strategy",
    content:
      "Our Q4 marketing strategy focuses on digital transformation and customer engagement. We plan to increase social media presence by 40% and launch three new product campaigns targeting millennials and Gen Z demographics.",
    type: "document",
    tags: ["marketing", "strategy", "Q4", "digital", "social media"],
    createdAt: "2024-01-15",
    modifiedAt: "2024-01-20",
    owner: "sarah.johnson@company.com",
  },
  {
    id: "5e6f7g8h",
    name: "Budget Analysis 2024",
    content:
      "Financial analysis showing 15% increase in revenue compared to 2023. Key areas of growth include software subscriptions (+25%) and consulting services (+18%). Recommended budget allocation for next quarter includes increased R&D spending.",
    type: "spreadsheet",
    tags: ["budget", "finance", "analysis", "revenue", "2024"],
    createdAt: "2024-02-01",
    modifiedAt: "2024-02-10",
    owner: "mike.chen@company.com",
  },
  {
    id: "9i0j1k2l",
    name: "Product Roadmap Presentation",
    content:
      "Comprehensive product roadmap for 2024-2025. Features include AI integration, mobile app improvements, and new API endpoints. Timeline shows major releases in Q2 and Q4 with beta testing phases.",
    type: "presentation",
    tags: ["product", "roadmap", "AI", "mobile", "API", "development"],
    createdAt: "2024-01-30",
    modifiedAt: "2024-02-05",
    owner: "alex.rodriguez@company.com",
  },
  {
    id: "3m4n5o6p",
    name: "Team Meeting Notes - January",
    content:
      "Weekly team meetings summary. Discussed project timelines, resource allocation, and upcoming deadlines. Action items include hiring two new developers and upgrading development tools.",
    type: "document",
    tags: ["meetings", "team", "january", "hiring", "development"],
    createdAt: "2024-01-31",
    modifiedAt: "2024-01-31",
    owner: "lisa.wang@company.com",
  },
  {
    id: "7q8r9s0t",
    name: "Customer Feedback Analysis",
    content:
      "Analysis of customer feedback from Q1. Overall satisfaction score: 4.2/5. Main complaints about slow loading times and limited mobile features. Positive feedback on customer support and new dashboard design.",
    type: "document",
    tags: [
      "customer",
      "feedback",
      "analysis",
      "satisfaction",
      "mobile",
      "support",
    ],
    createdAt: "2024-02-15",
    modifiedAt: "2024-02-18",
    owner: "david.kim@company.com",
  },
  {
    id: "1u2v3w4x",
    name: "Security Audit Report",
    content:
      "Comprehensive security audit completed. Found 3 medium-risk vulnerabilities and 7 low-risk issues. All critical systems are secure. Recommendations include updating authentication protocols and implementing additional monitoring.",
    type: "document",
    tags: [
      "security",
      "audit",
      "vulnerabilities",
      "authentication",
      "monitoring",
    ],
    createdAt: "2024-02-20",
    modifiedAt: "2024-02-22",
    owner: "jennifer.brown@company.com",
  },
];

const retrieveByNameOrIdTool = createTool({
  id: "retrieve-by-name-or-id",
  description: "Retrieve a specific Google Drive file by its exact name or ID",
  inputSchema: z.object({
    query: z.string().describe("The exact file name or file ID to search for"),
  }),
  outputSchema: z.object({
    files: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        content: z.string(),
        type: z.string(),
        owner: z.string(),
        createdAt: z.string(),
        modifiedAt: z.string(),
      })
    ),
    found: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { query } = context;

    let file = mockDriveFiles.find((f) => f.id === query);

    if (!file) {
      file = mockDriveFiles.find(
        (f) => f.name.toLowerCase() === query.toLowerCase()
      );
    }

    if (file) {
      return {
        files: [
          {
            id: file.id,
            name: file.name,
            content: file.content,
            type: file.type,
            owner: file.owner,
            createdAt: file.createdAt,
            modifiedAt: file.modifiedAt,
          },
        ],
        found: true,
        message: `Found file: ${file.name}`,
      };
    }

    return {
      files: [],
      found: false,
      message: `No file found with name or ID: ${query}`,
    };
  },
});

const keywordSearchTool = createTool({
  id: "keyword-search",
  description:
    "Search Google Drive files using keywords in file names, content, and tags",
  inputSchema: z.object({
    keywords: z
      .string()
      .describe("Keywords to search for in file names, content, and tags"),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 5)"),
  }),
  outputSchema: z.object({
    files: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        content: z.string(),
        type: z.string(),
        owner: z.string(),
        createdAt: z.string(),
        modifiedAt: z.string(),
        relevanceScore: z.number(),
      })
    ),
    totalFound: z.number(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { keywords, limit = 5 } = context;
    const searchTerms = keywords.toLowerCase().split(/\s+/);

    const scoredFiles = mockDriveFiles
      .map((file) => {
        let score = 0;

        // Calculate relevance score based on keyword matches
        searchTerms.forEach((term) => {
          const nameMatches = (
            file.name.toLowerCase().match(new RegExp(term, "g")) || []
          ).length;
          const contentMatches = (
            file.content.toLowerCase().match(new RegExp(term, "g")) || []
          ).length;
          const tagMatches = file.tags.filter((tag) =>
            tag.toLowerCase().includes(term)
          ).length;

          // Weight: name matches are worth more than content matches
          score += nameMatches * 3 + contentMatches * 1 + tagMatches * 2;
        });

        return {
          ...file,
          relevanceScore: score,
        };
      })
      .filter((file) => file.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return {
      files: scoredFiles.map((file) => ({
        id: file.id,
        name: file.name,
        content: file.content,
        type: file.type,
        owner: file.owner,
        createdAt: file.createdAt,
        modifiedAt: file.modifiedAt,
        relevanceScore: file.relevanceScore,
      })),
      totalFound: scoredFiles.length,
      message: `Found ${scoredFiles.length} files matching keywords: ${keywords}`,
    };
  },
});

const vectorSearchTool = createTool({
  id: "vector-search",
  description:
    "Perform semantic/vector search on Google Drive files using Pinecone vector database to find conceptually similar content",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Natural language query describing what you're looking for"),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 3)"),
  }),
  outputSchema: z.object({
    files: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        score: z.number(),
        source: z.string(),
        metadata: z.any().optional(),
      })
    ),
    totalFound: z.number(),
    message: z.string(),
    query: z.string(),
    namespace: z.string(),
  }),
  execute: async ({ context }) => {
    const { query, limit = 3 } = context;
    const namespace = "agentic-retrieval";

    try {
      const store = new PineconeVector({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const { embedding: queryVector } = await embed({
        model: textEmbedding,
        value: query,
      });

      const searchResults = await store.query({
        indexName: PINECONE_INDEX_NAME,
        queryVector,
        topK: limit,
        namespace,
      });

      const files = searchResults.map((result) => ({
        id: result.id,
        content: result.metadata?.text || result.metadata?.content || "",
        score: result.score || 0,
        source: result.metadata?.source || result.id || "unknown",
        metadata: result.metadata,
      }));

      return {
        files,
        totalFound: files.length,
        message: `Found ${files.length} semantically relevant files for: ${query}`,
        query,
        namespace,
      };
    } catch (error) {
      console.error("Error in vector search:", error);
      throw new Error(
        `Failed to perform vector search: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
});

const agenticRetrievalAgent = new Agent({
  name: "agentic-retrieval-agent",
  instructions: `You are an intelligent retrieval agent that helps users find information from Google Drive files. When the user asks for a file, you should use the most appropriate search method to find the file.`,
  model: flash,
  tools: {
    retrieveByNameOrIdTool,
    keywordSearchTool,
    vectorSearchTool,
  },
  memory: threadMemory,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, userId, threadId } = await req.json();
  const user = await UserService.createIfNotExists(userId);

  const agentStream = await agenticRetrievalAgent.stream(messages, {
    resourceId: user.id,
    threadId,
  });

  return agentStream.toDataStreamResponse();
}
