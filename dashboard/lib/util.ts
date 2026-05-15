export function timeAgo(date: Date | string | number): string {
  const ts =
    date instanceof Date
      ? Math.floor(date.getTime() / 1000)
      : typeof date === "string"
        ? Math.floor(new Date(date).getTime() / 1000)
        : date;
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - ts));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function stripHtml(html: string, max = 240): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export function extractImageSrcs(html: string, limit = 4): string[] {
  const out: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < limit) {
    out.push(m[1]);
  }
  return out;
}

export function messengerUrl(username: string): string {
  return `https://m.me/${username}`;
}

const DEFAULT_RSS_BRIDGE = "https://rss-bridge.org/bridge01";

export function bridgeFacebookUrl(username: string): string {
  const base = (process.env.RSS_BRIDGE_URL ?? DEFAULT_RSS_BRIDGE).replace(
    /\/+$/,
    "",
  );
  const params = new URLSearchParams({
    action: "display",
    bridge: "FacebookBridge",
    context: "User",
    u: username,
    media_type: "all",
    format: "Atom",
  });
  return `${base}/?${params.toString()}`;
}

export function isValidUsername(s: string): boolean {
  return /^[A-Za-z0-9.\-_]+$/.test(s);
}

export function cleanUsername(s: string): string {
  return s.trim().replace(/^@/, "");
}
