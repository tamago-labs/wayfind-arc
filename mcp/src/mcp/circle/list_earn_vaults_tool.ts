import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const ListEarnVaultsTool: McpTool = {
  name: "list_earn_vaults",
  description: "List available earn vaults on a specific chain, sorted by APY.",
  schema: {
    chain: z.string().describe("Chain name (e.g., 'arc', 'ethereum', 'base')"),
    symbol: z.string().optional().describe("Filter by asset symbol (e.g., 'USDC')"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.listEarnVaults(input.chain, input.symbol);
  },
};
