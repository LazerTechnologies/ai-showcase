import { MCPClient } from "@mastra/mcp";

// This is in a separate file because otherwise the MCPClient is recreated on every request (even if it's at the top of the route file)
export const mcpClient = new MCPClient({
  servers: {
    context7: {
      url: new URL("https://mcp.context7.com/mcp"),
      // If you needed to provide any headers, you could do so here
      // requestInit: {
      //   headers: {
      //     Authorization: "Bearer your-token",
      //   },
      // },
    },
  },
});
