import "server-only";
import { XMLParser } from "fast-xml-parser";
import { sql } from "drizzle-orm";
import { db, schema } from "./db";
import { bridgeFacebookUrl } from "./util";

export type ParsedItem = {
  title: string;
  content: string;
  link: string;
  publishedAt: Date;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
});

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function readText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number" || typeof node === "boolean") return String(node);
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj["#text"] === "string") return obj["#text"];
    if (typeof obj["#text"] === "number") return String(obj["#text"]);
  }
  return "";
}

function pickLink(links: unknown): string {
  for (const l of asArray(links)) {
    if (!l) continue;
    if (typeof l === "string") return l;
    if (typeof l === "object") {
      const obj = l as Record<string, unknown>;
      const rel = (obj["@_rel"] as string | undefined) ?? "alternate";
      const href = obj["@_href"] as string | undefined;
      if (rel === "alternate" && href) return href;
    }
  }
  for (const l of asArray(links)) {
    if (typeof l === "object") {
      const href = (l as Record<string, unknown>)["@_href"] as string | undefined;
      if (href) return href;
    }
  }
  return "";
}

function parseAtom(xml: string): ParsedItem[] {
  const parsed = parser.parse(xml) as { feed?: { entry?: unknown } };
  const entries = asArray(parsed.feed?.entry);
  const items: ParsedItem[] = [];
  for (const e of entries) {
    if (!e || typeof e !== "object") continue;
    const entry = e as Record<string, unknown>;
    const title = readText(entry.title);
    const content =
      readText(entry.content) || readText(entry.summary) || "";
    const link = pickLink(entry.link);
    const publishedStr =
      readText(entry.published) || readText(entry.updated) || "";
    const publishedAt = publishedStr ? new Date(publishedStr) : new Date();
    if (!link) continue;
    items.push({
      title: title || "(untitled)",
      content,
      link,
      publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    });
  }
  return items;
}

function parseRss(xml: string): ParsedItem[] {
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: unknown } };
  };
  const entries = asArray(parsed.rss?.channel?.item);
  const items: ParsedItem[] = [];
  for (const e of entries) {
    if (!e || typeof e !== "object") continue;
    const entry = e as Record<string, unknown>;
    const title = readText(entry.title);
    const content =
      readText(entry["content:encoded"]) ||
      readText(entry.description) ||
      "";
    const link = readText(entry.link) || readText(entry.guid);
    const publishedStr = readText(entry.pubDate) || readText(entry.date);
    const publishedAt = publishedStr ? new Date(publishedStr) : new Date();
    if (!link) continue;
    items.push({
      title: title || "(untitled)",
      content,
      link,
      publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    });
  }
  return items;
}

export async function fetchAndParse(feedUrl: string): Promise<ParsedItem[]> {
  const res = await fetch(feedUrl, {
    headers: {
      Accept:
        "application/atom+xml, application/rss+xml, application/xml, text/xml",
      "User-Agent": "facebook-rss-dashboard/1.0 (+https://vercel.app)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  if (xml.includes("<feed")) return parseAtom(xml);
  if (xml.includes("<rss")) return parseRss(xml);
  throw new Error("Unrecognized feed format (not Atom or RSS).");
}

export async function refreshFeed(feedId: number): Promise<number> {
  const [feed] = await db
    .select()
    .from(schema.feeds)
    .where(sql`${schema.feeds.id} = ${feedId}`)
    .limit(1);
  if (!feed) throw new Error(`Feed ${feedId} not found`);

  const parsed = await fetchAndParse(feed.rssUrl);
  let inserted = 0;
  if (parsed.length > 0) {
    const rows = parsed.map((p) => ({
      feedId: feed.id,
      title: p.title,
      content: p.content,
      link: p.link,
      publishedAt: p.publishedAt,
    }));
    const result = await db
      .insert(schema.items)
      .values(rows)
      .onConflictDoNothing({
        target: [schema.items.feedId, schema.items.link],
      })
      .returning({ id: schema.items.id });
    inserted = result.length;
  }
  await db
    .update(schema.feeds)
    .set({ lastFetchedAt: new Date() })
    .where(sql`${schema.feeds.id} = ${feedId}`);
  return inserted;
}

export function buildFacebookFeedUrl(username: string): string {
  return bridgeFacebookUrl(username);
}
