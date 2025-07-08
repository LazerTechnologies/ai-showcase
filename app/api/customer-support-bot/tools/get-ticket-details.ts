import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { SupportTicketService } from "../../../../services/support-ticket";
import { validateRuntimeContext } from "../shared";

export const getTicketDetailsTool = createTool({
  id: "get-ticket-details",
  description: "Get detailed information about a specific support ticket",
  inputSchema: z.object({
    ticketId: z.string().describe("The ID of the ticket to retrieve"),
  }),
  outputSchema: z.object({
    ticket: z
      .object({
        id: z.string(),
        description: z.string(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .optional(),
    found: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const { userId } = validateRuntimeContext(runtimeContext);

      const ticket = await SupportTicketService.getTicketById({
        requestingUserId: userId,
        ticketId: context.ticketId,
      });

      if (!ticket) {
        return {
          found: false,
          message: `Ticket ${context.ticketId} not found or you don't have permission to view it.`,
        };
      }

      return {
        ticket: {
          id: ticket.id,
          description: ticket.description,
          status: ticket.status,
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
        },
        found: true,
        message: `Retrieved details for ticket ${context.ticketId}`,
      };
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      return {
        found: false,
        message: "There was an error retrieving the ticket details.",
      };
    }
  },
});
