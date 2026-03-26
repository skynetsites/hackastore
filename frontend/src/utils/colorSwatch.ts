/** Cor para bolinha de filtro: hex ou nome aproximado */
export function colorToCss(color: string): string {
  const c = color.trim();
  if (!c) return "#9ca3af";
  if (c.startsWith("#")) return c.length >= 4 ? c : "#9ca3af";
  if (/^[0-9a-fA-F]{3,8}$/.test(c)) return c.startsWith("#") ? c : `#${c}`;
  const map: Record<string, string> = {
    black: "#111827",
    white: "#f9fafb",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    orange: "#f97316",
    purple: "#a855f7",
    pink: "#ec4899",
    gray: "#6b7280",
    grey: "#6b7280",
    brown: "#92400e",
    gold: "#d4af37",
    silver: "#94a3b8",
  };
  return map[c.toLowerCase()] ?? "#6b7280";
}
