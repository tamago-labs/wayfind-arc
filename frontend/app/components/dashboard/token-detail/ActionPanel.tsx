'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TokenConfig } from '@/lib/tokens';

type Tab = 'Swap' | 'Earn' | 'Borrow';

interface ActionPanelProps {
  token: TokenConfig;
  earnApy: number | null;
  borrowApy: number | null;
}

export default function ActionPanel({ token, earnApy, borrowApy }: ActionPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Swap');

  const tabs: Tab[] = ['Swap', 'Earn', 'Borrow'];

  return (
    <div className="bg-surface border border-border3/50 rounded-2xl overflow-hidden">
      <div className="flex border-b border-border3/50">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[13px] font-medium transition-colors relative ${
              activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="p-5"
        >
          {activeTab === 'Swap' && (
            <div className="text-center py-8">
              <p className="text-[13px] text-white/40">Swap {token.symbol}</p>
              <p className="text-[11px] text-white/20 mt-1">Coming soon</p>
            </div>
          )}
          {activeTab === 'Earn' && (
            <div className="text-center py-8">
              {earnApy != null ? (
                <>
                  <p className="text-[13px] text-white/40">Deposit {token.symbol}</p>
                  <p className="text-2xl font-semibold text-emerald-400 mt-2">{(earnApy * 100).toFixed(2)}%</p>
                  <p className="text-[11px] text-white/20 mt-1">APY</p>
                </>
              ) : (
                <>
                  <p className="text-[13px] text-white/40">No earn vaults for {token.symbol}</p>
                  <p className="text-[11px] text-white/20 mt-1">Coming soon</p>
                </>
              )}
            </div>
          )}
          {activeTab === 'Borrow' && (
            <div className="text-center py-8">
              {borrowApy != null ? (
                <>
                  <p className="text-[13px] text-white/40">Borrow against {token.symbol}</p>
                  <p className="text-2xl font-semibold text-white/80 mt-2">{(borrowApy * 100).toFixed(2)}%</p>
                  <p className="text-[11px] text-white/20 mt-1">Borrow APY</p>
                </>
              ) : (
                <>
                  <p className="text-[13px] text-white/40">No borrow markets for {token.symbol}</p>
                  <p className="text-[11px] text-white/20 mt-1">Coming soon</p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
