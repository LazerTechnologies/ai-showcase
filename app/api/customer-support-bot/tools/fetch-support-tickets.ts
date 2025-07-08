import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { SupportTicketService } from "../../../../services/support-ticket";
import { validateRuntimeContext } from "../shared";

export const fetchSupportTicketsTool = createTool({
  id: "fetch-support-tickets",
  description: "Fetch all support tickets for the current user",
  inputSchema: z.object({
    status: z
      .enum(["all", "open", "in-progress", "resolved", "closed"])
      .optional()
      .describe("Filter tickets by status"),
  }),
  outputSchema: z.object({
    tickets: z.array(
      z.object({
        id: z.string(),
        description: z.string(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
    totalCount: z.number(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const { userId } = validateRuntimeContext(runtimeContext);

      const tickets = await SupportTicketService.getTicketsByUser({
        requestingUserId: userId,
        statusFilter: context.status === "all" ? undefined : context.status,
      });

      const ticketSummaries = tickets.map((ticket) => ({
        id: ticket.id,
        description: ticket.description,
        status: ticket.status,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
      }));

      return {
        tickets: ticketSummaries,
        totalCount: ticketSummaries.length,
      };
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      return {
        tickets: [],
        totalCount: 0,
      };
    }
  },
});
