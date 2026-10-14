import type { Agent } from "../agent";
import type { McpTool } from "../types";
import { z } from "zod";

export const ArcEarnWithdrawTool: McpTool = {
  name: "arc_earn_withdraw",
  description: "Withdraw tokens from a Circle Earn vault. Symbol is resolved from token config.",
  schema: {
    symbol: z.string().describe("Token symbol to withdraw (e.g. 'USDC', 'WETH')"),
    amount: z.string().describe("Amount to withdraw"),
    vaultAddress: z.string().optional().describe("Specific vault address (auto-selected if omitted)"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.earnWithdraw(input.symbol, input.amount, input?.vaultAddress);
  },
};
