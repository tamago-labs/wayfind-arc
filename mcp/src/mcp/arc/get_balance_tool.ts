import type { Agent } from "../agent";
import type { McpTool } from "../types";
import { z } from "zod";

export const ArcGetBalanceTool: McpTool = {
  name: "arc_get_balance",
  description: "Get USDC and token balances for the Arc wallet. Optionally pass a symbol (e.g. 'USDC', 'cirBTC') to check a specific token.",
  schema: {
    symbol: z.string().optional().describe("Token symbol (e.g. 'USDC', 'WETH'). Omit for all tokens."),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.getBalance(input?.symbol);
  },
};
