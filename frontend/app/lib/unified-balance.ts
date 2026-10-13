import { ethers } from "ethers";
import { createEthersAdapterFromProvider } from "@circle-fin/adapter-ethers-v6";
import { createUnifiedBalanceKitContext, getBalances } from "@circle-fin/unified-balance-kit";

export interface UnifiedBalanceResult {
  totalConfirmed: string;
  totalPending: string;
  breakdown: Array<{
    chain: string;
    confirmedBalance: string;
    pendingBalance: string;
  }>;
}

export async function fetchUnifiedBalance(
  provider: ethers.Provider,
  address: string,
  chainId: number
): Promise<UnifiedBalanceResult> {
  const networkType = chainId === 5042002 ? "testnet" : "mainnet";

  const adapter = await createEthersAdapterFromProvider({
    provider: provider as unknown as ethers.Eip1193Provider,
    capabilities: {},
  });

  const context = createUnifiedBalanceKitContext();

  const result = await getBalances(context, {
    sources: [{ adapter }],
    networkType,
    includePending: true,
  });

  const breakdown: UnifiedBalanceResult["breakdown"] = [];
  if (result.breakdown) {
    for (const group of result.breakdown) {
      if (group.breakdown) {
        for (const item of group.breakdown) {
          breakdown.push({
            chain: item.chain,
            confirmedBalance: item.confirmedBalance ?? "0.00",
            pendingBalance: item.pendingBalance ?? "0.00",
          });
        }
      }
    }
  }

  return {
    totalConfirmed: result.totalConfirmedBalance ?? "0.00",
    totalPending: result.totalPendingBalance ?? "0.00",
    breakdown,
  };
}
