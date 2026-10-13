'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { truncate, getGradient } from '@/lib/wallet';
import { fetchUnifiedBalance, type UnifiedBalanceResult } from '@/lib/unified-balance';
import type { ChainConfig } from '@/lib/chains';

interface UnifiedBalanceProps {
  selectedChain: ChainConfig;
}

export default function UnifiedBalance({ selectedChain }: UnifiedBalanceProps) {
  const { address, chainId, getRawProvider } = useWallet();
  const [balance, setBalance] = useState<UnifiedBalanceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const gradient = getGradient(address);

  useEffect(() => {
    if (!address || !chainId) {
      setBalance(null);
      return;
    }

    const rawProvider = getRawProvider();
    if (!rawProvider) {
      setBalance(null);
      return;
    }

    setLoading(true);
    fetchUnifiedBalance(rawProvider as never, address, selectedChain.id)
      .then(setBalance)
      .catch(() => setBalance(null))
      .finally(() => setLoading(false));
  }, [address, chainId, selectedChain, getRawProvider]);

  if (!address) {
    return (
      <div className="bg-surface border border-border3/50 rounded-2xl p-6">
        <p className="text-[12px] text-white/30 uppercase tracking-wider mb-3">Unified Balance</p>
        <p className="text-[13px] text-white/40">Connect wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border3/50 rounded-2xl p-6">
      <p className="text-[12px] text-white/30 uppercase tracking-wider mb-1">Unified Balance</p>
      <p className="text-2xl font-semibold mb-4">
        {loading ? '—' : balance ? `${balance.totalConfirmed} USDC` : '0.00'} USDC
      </p>

      {balance && balance.breakdown.length > 0 && (
        <div className="space-y-2 mb-4">
          {balance.breakdown.map((item) => (
            <div key={item.chain} className="flex items-center justify-between text-[12px]">
              <span className="text-white/40">{item.chain}</span>
              <span className="text-white/60">{item.confirmedBalance} USDC</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          className="w-8 h-8 rounded-full flex items-center justify-center"
        >
          <span className="text-[11px] font-bold text-white/90">
            {address.slice(2, 4).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-mono text-[12px] text-white/50">{truncate(address)}</p>
          <p className="text-[11px] text-white/30">{selectedChain.name}</p>
        </div>
      </div>
    </div>
  );
}
