export function timeAgo(unixSeconds: number): string {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
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

const fbPatterns = [
  /facebook\.com\/([A-Za-z0-9.\-_]+)/i,
  /m\.me\/([A-Za-z0-9.\-_]+)/i,
];

export function extractFacebookUsername(...candidates: (string | undefined)[]): string | null {
  for (const c of candidates) {
    if (!c) continue;
    for (const re of fbPatterns) {
      const m = c.match(re);
      if (m) return m[1];
    }
    try {
      const u = new URL(c, "http://x");
      const userParam = u.searchParams.get("u") ?? u.searchParams.get("context");
      if (userParam && /^[A-Za-z0-9.\-_]+$/.test(userParam)) return userParam;
    } catch {
      // not a URL — fall through
    }
  }
  return null;
}

export function messengerUrl(username: string): string {
  return `https://m.me/${username}`;
}

export function bridgeFacebookUrl(rssBridgeBase: string, username: string): string {
  const base = rssBridgeBase.replace(/\/+$/, "");
  const params = new URLSearchParams({
    action: "display",
    bridge: "FacebookBridge",
    u: username,
    limit: "10",
    format: "Atom",
  });
  return `${base}/?${params.toString()}`;
}
