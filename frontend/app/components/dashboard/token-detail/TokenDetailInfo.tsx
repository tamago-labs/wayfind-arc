'use client';

import type { TokenConfig } from '@/lib/tokens';
import type { PriceData } from '@/lib/price-types';

function formatLarge(value: number): string {
  if (value === 0) return '—';
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
  return '$' + value.toFixed(2);
}

export default function TokenDetailInfo({
  token,
  priceData,
  earnApy,
  borrowApy,
}: {
  token: TokenConfig;
  priceData: PriceData | null;
  earnApy: number | null;
  borrowApy: number | null;
}) {
  return (
    <div className="bg-surface border border-border3/50 rounded-2xl p-5">
      <h3 className="text-[12px] text-white/30 uppercase tracking-wider mb-4">Token Info</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-[11px] text-white/20 uppercase tracking-wider">Market Cap</p>
          <p className="text-[13px] text-white/70 mt-1">{formatLarge(priceData?.marketCap ?? 0)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/20 uppercase tracking-wider">Volume 24h</p>
          <p className="text-[13px] text-white/70 mt-1">{formatLarge(priceData?.volume24h ?? 0)}</p>
        </div>
        <div>
          <p className="text-[11px] text-white/20 uppercase tracking-wider">Best Earn APY</p>
          <p className="text-[13px] text-white/70 mt-1">
            {earnApy != null ? `${(earnApy * 100).toFixed(2)}%` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-white/20 uppercase tracking-wider">Best Borrow APY</p>
          <p className="text-[13px] text-white/70 mt-1">
            {borrowApy != null ? `${(borrowApy * 100).toFixed(2)}%` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
