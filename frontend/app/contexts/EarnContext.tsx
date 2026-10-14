'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';

export interface VaultData {
  vaultAddress: string;
  chain: string;
  name: string;
  protocol: string;
  asset: string;
  currentApy: number;
  status: string;
  totalDeposits: string;
  liquidity: string;
}

interface EarnContextValue {
  vaults: VaultData[];
  loading: boolean;
  getBestApy: (asset: string) => number | null;
  getVaultsForAsset: (asset: string) => VaultData[];
}

const EarnContext = createContext<EarnContextValue>({
  vaults: [],
  loading: true,
  getBestApy: () => null,
  getVaultsForAsset: () => [],
});

export function EarnProvider({ children }: { children: React.ReactNode }) {
  const { chainId } = useWallet();
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef('');

  useEffect(() => {
    const chainParam = chainId === 5042 ? 'mainnet' : chainId === 5042002 ? 'testnet' : 'mainnet';
    if (fetchedRef.current === chainParam) return;
    fetchedRef.current = chainParam;

    fetch(`/api/earn-vaults?chain=${chainParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vaults) {
          setVaults(
            data.vaults.map((v: any) => ({
              vaultAddress: v.vaultAddress,
              chain: v.chain,
              name: v.name,
              protocol: v.protocol,
              asset: v.asset,
              currentApy: v.currentApy ?? 0,
              status: v.status,
              totalDeposits: v.totalDeposits ?? '0',
              liquidity: v.liquidity ?? '0',
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [chainId]);

  const getBestApy = useCallback(
    (asset: string): number | null => {
      const assetVaults = vaults.filter((v) => v.asset === asset && v.status === 'active');
      if (assetVaults.length === 0) return null;
      return Math.max(...assetVaults.map((v) => v.currentApy));
    },
    [vaults]
  );

  const getVaultsForAsset = useCallback(
    (asset: string): VaultData[] => {
      return vaults.filter((v) => v.asset === asset);
    },
    [vaults]
  );

  return (
    <EarnContext.Provider value={{ vaults, loading, getBestApy, getVaultsForAsset }}>
      {children}
    </EarnContext.Provider>
  );
}

export function useEarn() {
  return useContext(EarnContext);
}
