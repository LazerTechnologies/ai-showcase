import { UIMessage } from "ai";

/**
 * A wrapper around the UIMessage type that allows for a streamId to be added
 * to differentiate between messages from different agents in multi-agent scenarios.
 */
export interface MultiAgentUIMessage extends UIMessage {
  createdAt?: Date;
  streamId?: string;
}

