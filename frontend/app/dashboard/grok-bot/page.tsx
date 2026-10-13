export default function GrokBotPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Use in Grok Bot</h1>
      <div className="bg-surface border border-border3/50 rounded-xl p-8 text-center">
        <p className="text-[14px] text-white/40 mb-4">Export your Wayfind setup to Grok Bot or import agent skills.</p>
        <a
          href="https://wayfind.click"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] font-display font-medium bg-accent text-white px-5 py-2.5 rounded-lg hover:bg-accent/80 transition-colors"
        >
          Open Grok Bot
        </a>
      </div>
    </div>
  );
}
