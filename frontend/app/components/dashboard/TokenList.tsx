'use client';

import { useEffect, useState } from 'react';
import type { ChainConfig } from '@/lib/chains';
import { getTokensWithAddress, type TokenConfig } from '@/lib/tokens';
import { fetchTokenBalance } from '@/lib/usdc';
import { ethers } from 'ethers';
interface TokenListProps {
  selectedChain: ChainConfig;
  address: string | null;
}

interface TokenBalance {
  token: TokenConfig;
  balance: string | null;
}

export default function TokenList({ selectedChain, address }: TokenListProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  useEffect(() => {
    if (!address) {
      setBalances([]);
      return;
    }

    const tokens = getTokensWithAddress(selectedChain.id);
    if (tokens.length === 0) {
      setBalances([]);
      return;
    }

    const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);

    setBalances(tokens.map((t) => ({ token: t, balance: null })));

    tokens.forEach((token, index) => {
      const chainKey = selectedChain.id === 5042 ? 'arc' : 'arcTestnet';
      const tokenAddress = token.addresses[chainKey as 'arc' | 'arcTestnet'];

      if (!tokenAddress) {
        setBalances((prev) => prev.map((b, i) => (i === index ? { ...b, balance: '0.00' } : b)));
        return;
      }

      fetchTokenBalance(provider, tokenAddress, address, token.decimals)
        .then((balance) => {
          setBalances((prev) => prev.map((b, i) => (i === index ? { ...b, balance } : b)));
        })
        .catch(() => {
          setBalances((prev) => prev.map((b, i) => (i === index ? { ...b, balance: '0.00' } : b)));
        });
    });
  }, [address, selectedChain]);

  const tokens = getTokensWithAddress(selectedChain.id);

  return (
    <>
      <div className="bg-surface border border-border3/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border3/50">
          <p className="text-[12px] text-white/30 uppercase tracking-wider">Tokens on {selectedChain.name}</p>
        </div>
        <div className="divide-y divide-border3/30">
          {!address ? (
            <div className="px-5 py-6 text-center">
              <p className="text-[13px] text-white/40">Connect wallet to view balances</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-[13px] text-white/40">No supported tokens on this network</p>
            </div>
          ) : (
            tokens.map((item) => {
              const balanceEntry = balances.find((b) => b.token.symbol === item.symbol);
              const balance = balanceEntry?.balance;

              return (
                <div key={item.symbol} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-[10px] text-white/40 font-medium">
                          {item.symbol.slice(0, 3)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-[13px] font-medium text-white/80">{item.symbol}</p>
                      <p className="text-[11px] text-white/30">{item.name}</p>
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-white/60">
                    {balance !== null && balance !== undefined ? `${balance} ${item.symbol}` : '—'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

    </>
  );
}
