export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)]">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold mb-3">New Chat</h1>
        <p className="text-[14px] text-white/45 leading-relaxed">
          Start a conversation with your AI agent. Ask about on-chain data, portfolio management, or automate financial workflows on Arc.
        </p>
      </div>
    </div>
  );
}
