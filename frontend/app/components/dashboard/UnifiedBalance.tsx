'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { fetchUnifiedBalance, type UnifiedBalanceResult } from '@/lib/unified-balance';
import type { ChainConfig } from '@/lib/chains';

interface UnifiedBalanceProps {
  selectedChain: ChainConfig;
}

export default function UnifiedBalance({ selectedChain }: UnifiedBalanceProps) {
  const { address, chainId, getRawProvider } = useWallet();
  const [balance, setBalance] = useState<UnifiedBalanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

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
    <div className="bg-surface border border-border3/50 rounded-2xl p-6 relative">
      <p className="text-[12px] text-white/30 uppercase tracking-wider mb-1">Unified Balance</p>
      <div
        className="relative inline-block"
        onMouseEnter={() => setShowBreakdown(true)}
        onMouseLeave={() => setShowBreakdown(false)}
      >
        <p className="text-2xl font-semibold cursor-help">
          {loading ? '— USDC' : balance ? `${balance.totalConfirmed} USDC` : '0.00 USDC'}
        </p>

        <AnimatePresence>
          {showBreakdown && balance && balance.breakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 bg-dark border border-border3/50 rounded-xl p-4 min-w-[200px] z-30 shadow-xl"
            >
              <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Breakdown by Network</p>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
                {balance.breakdown.map((item) => (
                  <div key={item.chain} className="flex items-center justify-between text-[12px] gap-4">
                    <span className="text-white/40 truncate">{item.chain}</span>
                    <span className="text-white/60 shrink-0">{item.confirmedBalance}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
