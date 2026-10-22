import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const SwapTokensTool: McpTool = {
  name: "swap_tokens",
  description: "Swap tokens on a specific chain via Circle Swap Kit.",
  schema: {
    chain: z.string().describe("Chain name (e.g., 'arc', 'ethereum', 'base')"),
    fromSymbol: z.string().describe("Token to swap from (e.g., 'WETH')"),
    toSymbol: z.string().describe("Token to swap to (e.g., 'USDC')"),
    amount: z.string().describe("Amount of from token to swap"),
    slippagePercent: z.string().optional().describe("Slippage tolerance (default: '0.5')"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.swapTokens(input.chain, input.fromSymbol, input.toSymbol, input.amount, input.slippagePercent);
  },
};
