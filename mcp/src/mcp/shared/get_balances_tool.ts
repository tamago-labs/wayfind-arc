import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const GetBalancesTool: McpTool = {
  name: "get_balances",
  description: "Get token balances for a specific chain. Chain must be valid for the current network (testnet: arc, ethereum, base | mainnet: arc, ethereum, base, arbitrum, polygon, avalanche, optimism, world, sei)",
  schema: {
    chain: z.string().describe("Chain name (e.g., 'arc', 'ethereum', 'base', 'arbitrum')"),
    walletAddress: z.string().optional().describe("Optional wallet address (defaults to server's wallet)"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.getBalance(input.chain);
  },
};
