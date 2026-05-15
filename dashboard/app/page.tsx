import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { FeedCard, type FeedCardData } from "@/components/FeedCard";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { stripHtml, timeAgo } from "@/lib/util";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FeedAggregate = {
  id: number;
  name: string;
  username: string;
  messengerUrl: string;
  unread: number;
  latestContent: string | null;
  latestPublished: Date | null;
};

export default async function FeedsPage() {
  let cards: FeedCardData[] = [];
  let errorMessage: string | null = null;

  try {
    const rows = (await db
      .select({
        id: schema.feeds.id,
        name: schema.feeds.name,
        username: schema.feeds.username,
        messengerUrl: schema.feeds.messengerUrl,
        unread: sql<number>`COALESCE(SUM(CASE WHEN ${schema.items.isRead} = false THEN 1 ELSE 0 END), 0)::int`,
        latestContent: sql<string | null>`(
          SELECT i.content FROM ${schema.items} i
          WHERE i.feed_id = ${schema.feeds.id}
          ORDER BY i.published_at DESC LIMIT 1
        )`,
        latestPublished: sql<Date | null>`(
          SELECT i.published_at FROM ${schema.items} i
          WHERE i.feed_id = ${schema.feeds.id}
          ORDER BY i.published_at DESC LIMIT 1
        )`,
      })
      .from(schema.feeds)
      .leftJoin(schema.items, eq(schema.items.feedId, schema.feeds.id))
      .groupBy(schema.feeds.id)
      .orderBy(desc(schema.feeds.createdAt))) as FeedAggregate[];

    cards = rows.map((r) => ({
      id: r.id,
      name: r.name,
      username: r.username,
      messengerUrl: r.messengerUrl,
      unread: r.unread,
      previewText: r.latestContent ? stripHtml(r.latestContent, 180) : undefined,
      previewTimeAgo: r.latestPublished ? timeAgo(r.latestPublished) : undefined,
    }));
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            Your Feeds
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            All your subscribed Facebook pages in one place.
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
          </svg>
          Add Feed
        </Link>
      </div>

      {errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : cards.length === 0 ? (
        <EmptyState
          title="No feeds yet"
          description="Add a Facebook page to start tracking it. We fetch posts via RSS-Bridge and surface them here every 15 minutes."
          ctaHref="/add"
          ctaLabel="Add your first feed"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <FeedCard key={card.id} feed={card} />
          ))}
        </div>
      )}
    </div>
  );
}
