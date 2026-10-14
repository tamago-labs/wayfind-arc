'use client';

import { usePrice } from '@/contexts/PriceContext';
import { useEarn } from '@/contexts/EarnContext';
import { useBorrow } from '@/contexts/BorrowContext';
import type { TokenConfig } from '@/lib/tokens';
import TokenDetailHeader from './TokenDetailHeader';
import ActionPanel from './ActionPanel';
import PriceChart from './PriceChart';
import TokenDetailInfo from './TokenDetailInfo';

export default function TokenDetailClient({ token }: { token: TokenConfig }) {
  const { getPrice } = usePrice();
  const { getBestApy } = useEarn();
  const { getBestBorrowApy } = useBorrow();

  const priceData = getPrice(token.symbol);
  const earnApy = getBestApy(token.symbol);
  const borrowApy = getBestBorrowApy(token.symbol);

  return (
    <div className="space-y-6">
      <TokenDetailHeader token={token} priceData={priceData} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ActionPanel token={token} earnApy={earnApy} borrowApy={borrowApy} />
        </div>
        <div className="lg:col-span-3">
          <PriceChart token={token} />
        </div>
      </div>
      <TokenDetailInfo token={token} priceData={priceData} earnApy={earnApy} borrowApy={borrowApy} />
    </div>
  );
}
