import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { SupportTicketService } from "../../../../services/support-ticket";
import { validateRuntimeContext } from "../shared";

export const createSupportTicketTool = createTool({
  id: "create-support-ticket",
  description: "Create a new support ticket for the customer",
  inputSchema: z.object({
    description: z
      .string()
      .describe("Detailed description of the customer's issue"),
  }),
  outputSchema: z.object({
    ticketId: z.string(),
    status: z.string(),
    message: z.string(),
  }),
  execute: async (inputData, context) => {
    try {
      if (!context?.requestContext) {
        throw new Error("Request context is required");
      }
      const { userId } = validateRuntimeContext(context?.requestContext);

      const ticket = await SupportTicketService.createTicket({
        userId,
        ticketData: {
          description: inputData.description,
        },
      });

      return {
        ticketId: ticket.id,
        status: ticket.status,
        message: `Your support ticket ${ticket.id} has been created successfully. We'll review your issue and get back to you soon.`,
      };
    } catch (error) {
      console.error("Error creating support ticket:", error);
      return {
        ticketId: "",
        status: "error",
        message:
          "There was an error creating your support ticket. Please try again.",
      };
    }
  },
});
