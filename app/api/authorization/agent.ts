
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ALL_FILES } from "./mock-files";
import { threadMemory } from "../memory";
import { flash } from "../../utils/models";



// Create role-specific Google Drive tools
const createMockGoogleDriveTool = (userRole: "viewer" | "admin") => {
  return createTool({
    id: `google-drive-lookup-${userRole}`,
    description: "Search and retrieve files from Google Drive",
    inputSchema: z.object({
      query: z.string().describe("Search query for files"),
    }),
    outputSchema: z.object({
      files: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.enum(["file", "folder"]),
          size: z.string().optional(),
          lastModified: z.string(),
          owner: z.string(),
          permissions: z.array(z.string()),
        })
      ),
      totalResults: z.number(),
      hasMoreResults: z.boolean(),
    }),
    execute: async ({ context }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter files based on user role
      let authorizedFiles = ALL_FILES;

      if (userRole === "viewer") {
        // Viewers can only see files they have read permissions for
        authorizedFiles = ALL_FILES.filter(
          (file) => !file.permissions.includes("admin-only")
        );
      }

      // Simple file name matching
      if (context.query.trim()) {
        const searchTerm = context.query.toLowerCase();
        authorizedFiles = authorizedFiles.filter((file) =>
          file.name.toLowerCase().includes(searchTerm)
        );
      }

      return {
        files: authorizedFiles,
        totalResults: authorizedFiles.length,
        hasMoreResults: false,
      };
    },
  });
};

export function createAuthorizationAgent(userRole: "viewer" | "admin") {
  const baseInstructions =
    "You are an AI assistant with access to company resources.";

  let instructions: string;

  if (userRole === "admin") {
    instructions = `${baseInstructions} You have administrative privileges and can access all company files and data. You can help with sensitive operations, view confidential documents, and perform administrative tasks. When using the Google Drive tool, you have full access to all files including confidential ones.`;
  } else {
    instructions = `${baseInstructions} You have viewer-level access and can only access public company files and basic information. You cannot view confidential documents or perform administrative tasks. When using the Google Drive tool, you only have access to files you have permission to view.`;
  }

  const googleDriveTool = createMockGoogleDriveTool(userRole);

  

  return new Agent({
    name: `authorization-agent-${userRole}`,
    instructions,
    model: flash,
    tools: {
      googleDriveTool,
    },
    memory: threadMemory,
  });
}
