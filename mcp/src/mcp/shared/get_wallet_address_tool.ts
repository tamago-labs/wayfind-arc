import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const GetWalletAddressTool: McpTool = {
  name: "get_wallet_address",
  description: "Get wallet addresses for all supported chains on the configured network",
  schema: {},
  handler: async (agent: Agent, _input: Record<string, any>) => {
    const network = agent.config.network;
    const addresses: Record<string, { address: string; chainId: number }> = {};

    const chainIds: Record<string, Record<string, number>> = {
      testnet: {
        arc: 5042002,
        ethereum: 11155111,
        base: 84532,
      },
      mainnet: {
        arc: 5042,
        ethereum: 1,
        base: 8453,
        arbitrum: 42161,
        polygon: 137,
        avalanche: 43114,
        optimism: 10,
        world: 480,
        sei: 1329,
      },
    };

    const ids = chainIds[network] || {};
    for (const [chain, chainId] of Object.entries(ids)) {
      addresses[chain] = { address: agent.walletAddress, chainId };
    }

    return { network, addresses };
  },
};
