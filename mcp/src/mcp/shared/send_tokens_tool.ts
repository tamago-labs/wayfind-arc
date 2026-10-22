import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const SendTokensTool: McpTool = {
  name: "send_tokens",
  description: "Send tokens on a specific chain. Returns the transaction hash.",
  schema: {
    chain: z.string().describe("Chain name (e.g., 'arc', 'ethereum', 'base', 'arbitrum')"),
    token: z.string().describe("Token symbol (e.g., 'USDC', 'WETH', 'cirBTC')"),
    amount: z.string().describe("Amount to send"),
    recipient: z.string().describe("Recipient wallet address"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.sendTokens(input.chain, input.token, input.recipient, input.amount);
  },
};
