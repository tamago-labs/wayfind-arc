export function truncate(addr: string | null): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function getGradient(address: string): { from: string; to: string } {
  const colors = [
    ["#6C5CE7", "#00D2A0"],
    ["#3B82F6", "#8B5CF6"],
    ["#FF6B6B", "#6C5CE7"],
    ["#00D2A0", "#3B82F6"],
    ["#8B5CF6", "#FF6B6B"],
  ];
  const idx = address ? address.charCodeAt(2) % colors.length : 0;
  return { from: colors[idx][0], to: colors[idx][1] };
}
