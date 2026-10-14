'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export interface BorrowMarketData {
  marketId: string;
  protocol: string;
  loanAsset: string;
  collateralAsset: string;
  borrowApy: number;
  lltv: number | null;
}

interface BorrowContextValue {
  markets: BorrowMarketData[];
  loading: boolean;
  getBestBorrowApy: (collateralSymbol: string) => number | null;
}

const BorrowContext = createContext<BorrowContextValue>({
  markets: [],
  loading: true,
  getBestBorrowApy: () => null,
});

export function BorrowProvider({ children }: { children: React.ReactNode }) {
  const [markets, setMarkets] = useState<BorrowMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch('/api/borrow-markets')
      .then((res) => res.json())
      .then((data) => {
        if (data.markets) {
          setMarkets(
            data.markets.map((m: any) => ({
              marketId: m.marketId,
              protocol: m.protocol,
              loanAsset: m.loanAsset?.symbol ?? '',
              collateralAsset: m.collateralAsset?.symbol ?? '',
              borrowApy: m.borrowApy ?? 0,
              lltv: m.lltv ?? null,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getBestBorrowApy = useCallback(
    (collateralSymbol: string): number | null => {
      const matching = markets.filter((m) => m.collateralAsset === collateralSymbol);
      if (matching.length === 0) return null;
      return Math.max(...matching.map((m) => m.borrowApy));
    },
    [markets]
  );

  return (
    <BorrowContext.Provider value={{ markets, loading, getBestBorrowApy }}>
      {children}
    </BorrowContext.Provider>
  );
}

export function useBorrow() {
  return useContext(BorrowContext);
}
