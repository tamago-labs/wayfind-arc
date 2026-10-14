'use client';

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
            <Sidebar />
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
