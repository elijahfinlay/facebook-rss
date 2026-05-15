import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import {
  buildFacebookFeedUrl,
  fetchAndParse,
  refreshFeed,
} from "@/lib/rss";
import { cleanUsername, isValidUsername, messengerUrl } from "@/lib/util";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: schema.feeds.id,
        name: schema.feeds.name,
        username: schema.feeds.username,
        rssUrl: schema.feeds.rssUrl,
        messengerUrl: schema.feeds.messengerUrl,
        lastFetchedAt: schema.feeds.lastFetchedAt,
        createdAt: schema.feeds.createdAt,
        unread: sql<number>`COALESCE(SUM(CASE WHEN ${schema.items.isRead} = false THEN 1 ELSE 0 END), 0)::int`,
      })
      .from(schema.feeds)
      .leftJoin(schema.items, eq(schema.items.feedId, schema.feeds.id))
      .groupBy(schema.feeds.id)
      .orderBy(desc(schema.feeds.createdAt));

    return NextResponse.json({ feeds: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type AddBody = {
  mode?: "facebook" | "url";
  username?: string;
  rssUrl?: string;
  name?: string;
};

export async function POST(req: Request) {
  let body: AddBody;
  try {
    body = (await req.json()) as AddBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let rssUrl: string;
  let username: string | null = null;
  let displayName: string;

  const wantsFacebook = body.mode === "facebook" || (!body.mode && body.username);
  if (wantsFacebook) {
    const u = cleanUsername(body.username ?? "");
    if (!u || !isValidUsername(u)) {
      return NextResponse.json(
        { error: "Invalid Facebook page username." },
        { status: 400 },
      );
    }
    username = u;
    rssUrl = buildFacebookFeedUrl(u);
    displayName = body.name?.trim() || u;
  } else {
    const url = (body.rssUrl ?? "").trim();
    if (!url) {
      return NextResponse.json(
        { error: "Provide either `username` or `rssUrl`." },
        { status: 400 },
      );
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Only http(s) URLs are supported.");
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid URL." },
        { status: 400 },
      );
    }
    rssUrl = url;
    displayName = body.name?.trim() || new URL(url).hostname;
  }

  try {
    const existing = await db
      .select({ id: schema.feeds.id, name: schema.feeds.name })
      .from(schema.feeds)
      .where(eq(schema.feeds.rssUrl, rssUrl))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Already subscribed (${existing[0].name}).` },
        { status: 409 },
      );
    }

    // Fail fast: try fetching before we save anything, so the user gets
    // an actionable error instead of an empty feed.
    let probeError: string | null = null;
    try {
      await fetchAndParse(rssUrl);
    } catch (err) {
      probeError = err instanceof Error ? err.message : "Unknown error";
    }
    if (probeError) {
      return NextResponse.json(
        { error: `Couldn't fetch this feed: ${probeError}` },
        { status: 422 },
      );
    }

    const [feed] = await db
      .insert(schema.feeds)
      .values({
        name: displayName,
        username,
        rssUrl,
        messengerUrl: username ? messengerUrl(username) : null,
      })
      .returning();

    let initialItems = 0;
    try {
      initialItems = await refreshFeed(feed.id);
    } catch {
      // The probe succeeded but a second fetch failed (rare). Leave the feed
      // saved; the next refresh will populate it.
    }

    return NextResponse.json({ ok: true, feed, initialItems });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
