import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { refreshFeed, buildFacebookFeedUrl } from "@/lib/rss";
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      username?: string;
      name?: string;
    };
    const username = cleanUsername(body.username ?? "");
    if (!username || !isValidUsername(username)) {
      return NextResponse.json(
        { error: "Invalid Facebook page username." },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: schema.feeds.id })
      .from(schema.feeds)
      .where(eq(schema.feeds.username, username))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Already subscribed to @${username}.` },
        { status: 409 },
      );
    }

    const rssUrl = buildFacebookFeedUrl(username);
    const [feed] = await db
      .insert(schema.feeds)
      .values({
        name: body.name?.trim() || username,
        username,
        rssUrl,
        messengerUrl: messengerUrl(username),
      })
      .returning();

    let initialItems = 0;
    let fetchError: string | null = null;
    try {
      initialItems = await refreshFeed(feed.id);
    } catch (err) {
      fetchError = err instanceof Error ? err.message : "Unknown error";
    }

    return NextResponse.json({
      ok: true,
      feed,
      initialItems,
      fetchError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
