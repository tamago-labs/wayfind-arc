"use client";

import { useState } from "react";
import { createUnifiedBalanceKitContext, getBalances, deposit, spend } from "@circle-fin/unified-balance-kit";
import type { Adapter } from "@/contexts/WalletContext";

const CHAIN_MAP: Record<number, "Arc" | "Arc_Testnet"> = {
  5042: "Arc",
  5042002: "Arc_Testnet",
};

export interface UnifiedBalanceResult {
  totalConfirmed: string;
  totalPending: string;
  chains: Array<{ chain: string; confirmed: string; pending: string }>;
}

export async function fetchUnifiedBalance(
  adapter: Adapter,
  chainId: number
): Promise<{ totalConfirmed: string; totalPending: string; chains: Array<{ chain: string; confirmed: string; pending: string }> }> {
  const networkType = chainId === 5042002 ? "testnet" : "mainnet";

  const context = createUnifiedBalanceKitContext();
  const result = await getBalances(context, {
    sources: [{ adapter }],
    networkType,
    includePending: true,
  });

  const chains: Array<{ chain: string; confirmed: string; pending: string }> = [];
  if (result.breakdown) {
    for (const group of result.breakdown) {
      if (group.breakdown) {
        for (const item of group.breakdown) {
          chains.push({
            chain: item.chain,
            confirmed: item.confirmedBalance ?? "0.00",
            pending: item.pendingBalance ?? "0.00",
          });
        }
      }
    }
  }

  return {
    totalConfirmed: result.totalConfirmedBalance ?? "0.00",
    totalPending: result.totalPendingBalance ?? "0.00",
    chains,
  };
}

export async function depositToUnifiedBalance(
  adapter: Adapter,
  chainId: number,
  amount: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const chainName = CHAIN_MAP[chainId];
    if (!chainName) return { success: false, error: "Unsupported chain" };

    const context = createUnifiedBalanceKitContext();
    await deposit(context, {
      from: { adapter, chain: chainName },
      amount,
      token: "USDC",
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Deposit failed" };
  }
}

export async function withdrawFromUnifiedBalance(
  adapter: Adapter,
  chainId: number,
  amount: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const chainName = CHAIN_MAP[chainId];
    if (!chainName) return { success: false, error: "Unsupported chain" };

    const context = createUnifiedBalanceKitContext();
    await spend(context, {
      amount,
      token: "USDC",
      from: [{ adapter }],
      to: { adapter, chain: chainName },
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Withdrawal failed" };
  }
}
