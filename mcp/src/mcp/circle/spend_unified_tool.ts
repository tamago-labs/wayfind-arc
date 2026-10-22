import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const SpendUnifiedBalanceTool: McpTool = {
  name: "spend_unified_balance",
  description: "Spend USDC from your Circle Unified Balance to a recipient on any chain.",
  schema: {
    sourceChain: z.string().describe("Source chain (e.g., 'arc', 'ethereum', 'base')"),
    amount: z.string().describe("Amount of USDC to spend"),
    recipient: z.string().optional().describe("Recipient wallet address (defaults to own wallet)"),
    targetChain: z.string().optional().describe("Chain to receive USDC (e.g., 'arc', 'ethereum', 'base', 'arbitrum')"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.spendUnifiedBalance(input.sourceChain, input.amount, input.recipient, input.targetChain);
  },
};
