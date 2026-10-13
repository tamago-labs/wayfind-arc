'use client';

import { Wallet } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-14 sticky top-0 z-20 bg-dark/80 backdrop-blur border-b border-border3/50 flex items-center justify-end px-6">
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-accent text-white hover:bg-accent/80 transition-colors">
        <Wallet className="w-3.5 h-3.5" />
        Connect Wallet
      </button>
    </header>
  );
}
