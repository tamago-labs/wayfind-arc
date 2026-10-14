'use client';

import { Suspense } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { WalletProvider } from '@/contexts/WalletContext';
import { PriceProvider } from '@/contexts/PriceContext';
import { EarnProvider } from '@/contexts/EarnContext';
import { BorrowProvider } from '@/contexts/BorrowContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <PriceProvider>
        <EarnProvider>
          <BorrowProvider>
            <div className="min-h-screen bg-dark">
              <Suspense fallback={<div className="fixed top-0 left-0 h-screen w-56 bg-surface border-r border-border3/50" />}>
                <Sidebar />
              </Suspense>
              <div className="ml-56 flex flex-col min-h-screen">
                <Topbar />
                <main className="flex-1 p-6">{children}</main>
              </div>
            </div>
          </BorrowProvider>
        </EarnProvider>
      </PriceProvider>
    </WalletProvider>
  );
}
