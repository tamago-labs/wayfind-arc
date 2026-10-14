'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TokenConfig } from '@/lib/tokens';
import SwapPanel from './SwapPanel';
import EarnPanel from './EarnPanel';

type Action = 'Swap' | 'Earn' | 'Borrow';

interface ActionPanelProps {
  token: TokenConfig;
  earnApy: number | null;
  borrowApy: number | null;
}

export default function ActionPanel({ token, earnApy, borrowApy }: ActionPanelProps) {
  const [active, setActive] = useState<Action>('Swap');

  const actions: Action[] = ['Swap', 'Earn', 'Borrow'];

  return (
    <div className="space-y-5">
      <div className="flex gap-5">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => setActive(action)}
            className={`text-[18px] font-semibold transition-colors ${
              active === action ? 'text-white' : 'text-white/30 hover:text-white/50'
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {active === 'Swap' && <SwapPanel token={token} />}
          {active === 'Earn' && <EarnPanel token={token} earnApy={earnApy} />}
          {active === 'Borrow' && (
            <div className="bg-surface border border-border3/50 rounded-2xl p-5 min-h-[120px]">
              <div className="py-4">
                {borrowApy != null ? (
                  <>
                    <p className="text-[13px] text-white/40">Borrow against {token.symbol}</p>
                    <p className="text-2xl font-semibold text-white/80 mt-2">{(borrowApy * 100).toFixed(2)}%</p>
                    <p className="text-[11px] text-white/20 mt-1">Borrow APY</p>
                  </>
                ) : (
                  <p className="text-[13px] text-white/40">No borrow markets for {token.symbol}</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
