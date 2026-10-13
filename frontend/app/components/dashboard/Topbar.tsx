'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Wallet, ChevronDown, Copy, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { truncate, getGradient } from '@/lib/wallet';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import { WalletModal } from './WalletModal';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'New Chat',
  '/dashboard/portfolio': 'Portfolio',
  '/dashboard/explore': 'Explore',
  '/dashboard/grok-bot': 'Use in Grok Bot',
  '/dashboard/chats': 'Saved Chats',
};

export default function Topbar() {
  const pathname = usePathname();
  const { address, chain, disconnect, switchToChain } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const gradient = getGradient(address);

  const popover = {
    hidden: { opacity: 0, y: -8, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 300 } },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <>
      <header className="h-14 sticky top-0 z-20 bg-dark/80 backdrop-blur border-b border-border3/50 flex items-center justify-between px-6">
        <p className="font-display text-sm font-semibold text-white/70">{pageTitle}</p>
        {address ? (
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              className="relative flex items-center gap-2"
            >
              <div
                style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-white/90">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${popoverOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {popoverOpen && (
                <motion.div
                  variants={popover}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-full right-0 mt-2 bg-surface border border-border3/50 rounded-lg overflow-hidden min-w-[200px] z-30 shadow-xl"
                >
                  <div className="px-4 py-3 border-b border-border3/50">
                    <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1">Address</p>
                    <p className="font-mono text-[12px] text-white/60 mb-3">{truncate(address)}</p>
                    <p className="text-[11px] uppercase tracking-wider text-white/30 mb-2">Network</p>
                    <div className="space-y-1">
                      {SUPPORTED_CHAINS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { void switchToChain(c.id); }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors hover:bg-white/[0.04]"
                        >
                          <Circle
                            className="w-3 h-3"
                            fill={chain?.id === c.id ? c.color : 'none'}
                            stroke={chain?.id === c.id ? c.color : 'rgba(255,255,255,0.2)'}
                          />
                          <span className={chain?.id === c.id ? 'text-white/80' : 'text-white/40'}>{c.name}</span>
                          {chain?.id === c.id && (
                            <Check className="w-3 h-3 text-white/60 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy address'}
                  </button>
                  <button
                    onClick={() => { disconnect(); setPopoverOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    Disconnect
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            Connect Wallet
          </button>
        )}
      </header>

      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
