import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const EarnWithdrawTool: McpTool = {
  name: "earn_withdraw",
  description: "Withdraw from an earn vault on a specific chain.",
  schema: {
    chain: z.string().describe("Chain name (e.g., 'arc', 'ethereum', 'base')"),
    vaultAddress: z.string().describe("Earn vault address"),
    amount: z.string().describe("Amount to withdraw"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.earnWithdraw(input.chain, input.amount, input.vaultAddress);
  },
};
