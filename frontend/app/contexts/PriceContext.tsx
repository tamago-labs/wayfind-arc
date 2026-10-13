'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { TOKENS } from '@/lib/tokens';
import type { PriceData, PriceDataMap } from '@/lib/price-types';

interface PriceContextValue {
  getPrice: (symbol: string) => PriceData | null;
  loading: boolean;
}

const PriceContext = createContext<PriceContextValue>({
  getPrice: () => null,
  loading: true,
});

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [priceMap, setPriceMap] = useState<PriceDataMap>({});
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const ids = TOKENS.map((t) => t.crypto_id).join(',');
    if (!ids) {
      setLoading(false);
      return;
    }

    fetch(`/api/crypto-prices?id=${ids}`)
      .then((res) => res.json())
      .then((data) => {
        const map: PriceDataMap = {};
        for (const token of TOKENS) {
          const quote = data.data?.[String(token.crypto_id)];
          if (!quote) continue;
          const usd = quote.quote?.USD;
          if (!usd) continue;
          map[token.symbol] = {
            price: usd.price ?? 0,
            marketCap: usd.market_cap ?? 0,
            volume24h: usd.volume_24h ?? 0,
            percentChange1h: usd.percent_change_1h ?? 0,
            percentChange24h: usd.percent_change_24h ?? 0,
            percentChange7d: usd.percent_change_7d ?? 0,
            percentChange30d: usd.percent_change_30d ?? 0,
            circulatingSupply: quote.circulating_supply ?? 0,
            totalSupply: quote.total_supply ?? 0,
            maxSupply: quote.max_supply ?? null,
            lastUpdated: usd.last_updated ?? '',
          };
        }
        setPriceMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getPrice = useCallback(
    (symbol: string): PriceData | null => {
      return priceMap[symbol] ?? null;
    },
    [priceMap]
  );

  return (
    <PriceContext.Provider value={{ getPrice, loading }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  return useContext(PriceContext);
}
