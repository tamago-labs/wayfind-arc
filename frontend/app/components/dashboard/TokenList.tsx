'use client';

import { useEffect, useState } from 'react';
import type { ChainConfig } from '@/lib/chains';
import { fetchUSDCBalance } from '@/lib/usdc';
import { ethers } from 'ethers';

interface TokenListProps {
  selectedChain: ChainConfig;
  address: string | null;
}

export default function TokenList({ selectedChain, address }: TokenListProps) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
    fetchUSDCBalance(provider, address, selectedChain.id).then(setBalance);
  }, [address, selectedChain]);

  return (
    <div className="bg-surface border border-border3/50 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border3/50">
        <p className="text-[12px] text-white/30 uppercase tracking-wider">Tokens on {selectedChain.name}</p>
      </div>
      <div className="divide-y divide-border3/30">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png"
              alt="USDC"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-[13px] font-medium text-white/80">USDC</p>
              <p className="text-[11px] text-white/30">USD Coin</p>
            </div>
          </div>
          <p className="text-[13px] font-medium text-white/60">
            {address ? (balance !== null ? `${balance} USDC` : '—') : 'Connect wallet'}
          </p>
        </div>
      </div>
    </div>
  );
}
