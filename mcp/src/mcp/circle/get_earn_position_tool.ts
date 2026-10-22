import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const GetEarnPositionTool: McpTool = {
  name: "get_earn_position",
  description: "Get earn vault position (balance, shares, yield) for a vault on a specific chain.",
  schema: {
    chain: z.string().describe("Chain name (e.g., 'arc', 'ethereum', 'base')"),
    vaultAddress: z.string().describe("Earn vault address"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.getEarnPosition(input.chain, input.vaultAddress);
  },
};
