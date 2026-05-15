import "server-only";

export type Subscription = {
  id: string;
  title: string;
  url: string;
  htmlUrl: string;
  iconUrl?: string;
  categories?: { id: string; label: string }[];
};

export type StreamItem = {
  id: string;
  title: string;
  author?: string;
  published: number;
  updated?: number;
  canonicalUrl?: string;
  summaryHtml: string;
  origin: { streamId: string; title: string; htmlUrl?: string };
};

export type StreamItemsResponse = {
  items: StreamItem[];
  continuation?: string;
};

type Config = {
  baseUrl: string;
  user: string;
  password: string;
};

function getConfig(): Config {
  const baseUrl = process.env.FRESHRSS_URL?.replace(/\/+$/, "") ?? "";
  const user = process.env.FRESHRSS_USER ?? "";
  const password = process.env.FRESHRSS_PASS ?? "";
  if (!baseUrl || !user || !password) {
    throw new Error(
      "FreshRSS not configured. Set FRESHRSS_URL, FRESHRSS_USER, FRESHRSS_PASS in .env.local.",
    );
  }
  return { baseUrl, user, password };
}

let cachedToken: { auth: string; expires: number } | null = null;

async function login(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.auth;
  }
  const { baseUrl, user, password } = getConfig();
  const body = new URLSearchParams({ Email: user, Passwd: password });
  const res = await fetch(`${baseUrl}/api/greader.php/accounts/ClientLogin`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`FreshRSS login failed: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const match = text.match(/Auth=(.+)/);
  if (!match) {
    throw new Error("FreshRSS login response missing Auth token.");
  }
  const auth = match[1].trim();
  cachedToken = { auth, expires: Date.now() + 30 * 60 * 1000 };
  return auth;
}

async function getWriteToken(): Promise<string> {
  const { baseUrl } = getConfig();
  const auth = await login();
  const res = await fetch(`${baseUrl}/api/greader.php/reader/api/0/token`, {
    headers: { Authorization: `GoogleLogin auth=${auth}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch write token: ${res.status}`);
  }
  return (await res.text()).trim();
}

async function api(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const { baseUrl } = getConfig();
  const auth = await login();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `GoogleLogin auth=${auth}`);
  const url = `${baseUrl}/api/greader.php${path}`;
  return fetch(url, { ...init, headers, cache: "no-store" });
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const res = await api("/reader/api/0/subscription/list?output=json");
  if (!res.ok) throw new Error(`subscription/list failed: ${res.status}`);
  const data = (await res.json()) as {
    subscriptions: Array<{
      id: string;
      title: string;
      url: string;
      htmlUrl: string;
      iconUrl?: string;
      categories?: { id: string; label: string }[];
    }>;
  };
  return data.subscriptions.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url,
    htmlUrl: s.htmlUrl,
    iconUrl: s.iconUrl,
    categories: s.categories,
  }));
}

export async function streamContents(
  streamId: string,
  count = 20,
): Promise<StreamItemsResponse> {
  const encoded = encodeURIComponent(streamId);
  const res = await api(
    `/reader/api/0/stream/contents/${encoded}?output=json&n=${count}`,
  );
  if (!res.ok) throw new Error(`stream/contents failed: ${res.status}`);
  const data = (await res.json()) as {
    items: Array<{
      id: string;
      title: string;
      author?: string;
      published: number;
      updated?: number;
      canonical?: { href: string }[];
      alternate?: { href: string }[];
      summary?: { content?: string };
      content?: { content?: string };
      origin: { streamId: string; title: string; htmlUrl?: string };
    }>;
    continuation?: string;
  };
  return {
    continuation: data.continuation,
    items: data.items.map((it) => ({
      id: it.id,
      title: it.title,
      author: it.author,
      published: it.published,
      updated: it.updated,
      canonicalUrl: it.canonical?.[0]?.href ?? it.alternate?.[0]?.href,
      summaryHtml: it.content?.content ?? it.summary?.content ?? "",
      origin: it.origin,
    })),
  };
}

export async function unreadCounts(): Promise<Record<string, number>> {
  const res = await api("/reader/api/0/unread-count?output=json");
  if (!res.ok) throw new Error(`unread-count failed: ${res.status}`);
  const data = (await res.json()) as {
    unreadcounts: Array<{ id: string; count: number }>;
  };
  const map: Record<string, number> = {};
  for (const row of data.unreadcounts) map[row.id] = row.count;
  return map;
}

export async function quickAdd(feedUrl: string): Promise<void> {
  const token = await getWriteToken();
  const body = new URLSearchParams({ quickadd: feedUrl, T: token });
  const res = await api("/reader/api/0/subscription/quickadd", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`quickadd failed: ${res.status} ${text}`);
  }
}

export async function unsubscribe(streamId: string): Promise<void> {
  const token = await getWriteToken();
  const body = new URLSearchParams({
    s: streamId,
    ac: "unsubscribe",
    T: token,
  });
  const res = await api("/reader/api/0/subscription/edit", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`unsubscribe failed: ${res.status} ${text}`);
  }
}

export async function markRead(itemId: string): Promise<void> {
  const token = await getWriteToken();
  const body = new URLSearchParams({
    i: itemId,
    a: "user/-/state/com.google/read",
    T: token,
  });
  const res = await api("/reader/api/0/edit-tag", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!res.ok) throw new Error(`edit-tag failed: ${res.status}`);
}
