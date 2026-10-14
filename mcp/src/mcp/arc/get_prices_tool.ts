import type { Agent } from "../agent";
import type { McpTool } from "../types";
import { z } from "zod";

export const ArcGetPricesTool: McpTool = {
  name: "arc_get_prices",
  description: "Get token prices from CoinGecko by symbol. Supports: USDC, EURC, cirBTC, WETH.",
  schema: {
    symbols: z.array(z.string()).describe("Array of token symbols (e.g. ['USDC', 'WETH', 'cirBTC'])"),
  },
  handler: async (agent: Agent, input: Record<string, any>) => {
    return agent.getPrices(input.symbols);
  },
};
