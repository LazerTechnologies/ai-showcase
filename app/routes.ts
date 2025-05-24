export const routes = {
  home: "/",
  mcp: "/mcp",
  toolUsageAgent: "/tool-usage-agent",
  multiAgentCollaboration: "/multi-agent-collaboration",
  codeGenerationAssistant: "/code-generation-assistant",
  dataAnalysisPipeline: "/data-analysis-pipeline",
  customerSupportBot: "/customer-support-bot",
  researchAssistant: "/research-assistant",
} as const;

export type Route = (typeof routes)[keyof typeof routes];

export const routeTitles: Record<Route, string> = {
  "/": "General Chat",
  "/mcp": "MCP",
  "/tool-usage-agent": "Tool Usage Agent",
  "/multi-agent-collaboration": "Multi-Agent Collaboration",
  "/code-generation-assistant": "Code Generation Assistant",
  "/data-analysis-pipeline": "Data Analysis Pipeline",
  "/customer-support-bot": "Customer Support Bot",
  "/research-assistant": "Research Assistant",
} as const;
