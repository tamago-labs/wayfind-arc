export default function PortfolioPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Portfolio</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border3/50 rounded-xl p-5">
          <p className="text-[12px] text-white/40 mb-1">Total Value</p>
          <p className="text-xl font-semibold">—</p>
        </div>
        <div className="bg-surface border border-border3/50 rounded-xl p-5">
          <p className="text-[12px] text-white/40 mb-1">24h Change</p>
          <p className="text-xl font-semibold">—</p>
        </div>
        <div className="bg-surface border border-border3/50 rounded-xl p-5">
          <p className="text-[12px] text-white/40 mb-1">Positions</p>
          <p className="text-xl font-semibold">0</p>
        </div>
      </div>
      <div className="bg-surface border border-border3/50 rounded-xl p-8 text-center">
        <p className="text-[14px] text-white/40">Connect your wallet to view your portfolio.</p>
      </div>
    </div>
  );
}
