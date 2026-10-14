import type { Agent } from "../agent";
import type { McpTool } from "../types";
import { z } from "zod";

export const ArcSpendUnifiedBalanceTool: McpTool = {
  name: "arc_spend_unified_balance",
  description: "Spend/withdraw USDC from Circle Unified Balance. Can send to a different address and optionally bridge to another chain (e.g. 'Ethereum', 'Solana', 'Base').",
  schema: {
    amount: z.string().describe("Amount of USDC to spend/withdraw"),
    recipient: z.string().optional().describe("Recipient address (defaults to sender)"),
    targetChain: z.string().optional().describe("Target chain for cross-chain transfer (e.g. 'Ethereum', 'Solana', 'Base', 'Arbitrum')"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.spendUnifiedBalance(input.amount, input?.recipient, input?.targetChain);
  },
};
