import type { Agent } from "../agent";
import type { McpTool } from "../types";
import { z } from "zod";

export const ArcEarnDepositTool: McpTool = {
  name: "arc_earn_deposit",
  description: "Deposit tokens into a Circle Earn vault to earn yield. Symbol is resolved from token config.",
  schema: {
    symbol: z.string().describe("Token symbol to deposit (e.g. 'USDC', 'WETH')"),
    amount: z.string().describe("Amount to deposit"),
    vaultAddress: z.string().optional().describe("Specific vault address (auto-selected if omitted)"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.earnDeposit(input.symbol, input.amount, input?.vaultAddress);
  },
};
