export const routes = {
  home: "/",
  mcp: "/mcp",
  toolUsageAgent: "/tool-usage-agent",
  multiAgentCollaboration: "/multi-agent-collaboration",
  multiAgentCollaborationNetwork: "/multi-agent-collaboration-network",
  codeGenerationAssistant: "/code-generation-assistant",
  dataAnalysisPipeline: "/data-analysis-pipeline",
  customerSupportBot: "/customer-support-bot",
  researchAssistant: "/research-assistant",
  authorization: "/authorization",
  rag: "/rag",
  agenticRetrieval: "/agentic-retrieval",
  textToSql: "/text-to-sql",
} as const;

export type Route = (typeof routes)[keyof typeof routes];

export const routeTitles: Record<Route, string> = {
  "/": "General Chat",
  "/mcp": "MCP",
  "/tool-usage-agent": "Tool Usage Agent",
  "/multi-agent-collaboration": "Multi-Agent Collaboration (via Tool Calling)",
  "/multi-agent-collaboration-network":
    "Multi-Agent Collaboration (via Agent Network)",
  "/code-generation-assistant": "Code Generation Assistant",
  "/data-analysis-pipeline": "Data Analysis Pipeline",
  "/customer-support-bot": "Customer Support Bot",
  "/research-assistant": "Research Assistant",
  "/authorization": "Authorization",
  "/rag": "RAG with Pinecone",
  "/agentic-retrieval": "Agentic Retrieval",
  "/text-to-sql": "Text To SQL",
} as const;
