import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { extractImageSrcs, stripHtml } from "@/lib/util";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const feedId = Number(params.id);
  if (!Number.isFinite(feedId) || feedId <= 0) {
    return <ErrorState message="Invalid feed id." />;
  }

  let feedName = "Feed";
  let username: string | null = null;
  let messengerLink: string | null = null;
  let posts: PostCardData[] = [];
  let errorMessage: string | null = null;

  try {
    const [feed] = await db
      .select()
      .from(schema.feeds)
      .where(eq(schema.feeds.id, feedId))
      .limit(1);
    if (!feed) {
      return (
        <EmptyState
          title="Feed not found"
          description="This feed may have been removed."
          ctaHref="/"
          ctaLabel="Back to feeds"
        />
      );
    }
    feedName = feed.name;
    username = feed.username;
    messengerLink = feed.messengerUrl;

    const rows = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.feedId, feedId))
      .orderBy(desc(schema.items.publishedAt))
      .limit(30);

    posts = rows.map((it) => ({
      id: it.id,
      title: it.title,
      text: stripHtml(it.content, 1200),
      images: extractImageSrcs(it.content, 4),
      publishedAt: it.publishedAt,
      link: it.link,
    }));

    if (rows.length > 0) {
      await db
        .update(schema.items)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.items.feedId, feedId),
            eq(schema.items.isRead, false),
          ),
        );
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-500 transition hover:text-ink-900"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12l4.6-4.6Z" />
        </svg>
        Back to feeds
      </Link>

      <div className="mt-4 mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            {feedName}
          </h1>
          {username && (
            <p className="mt-1.5 text-sm text-ink-500">@{username}</p>
          )}
        </div>
        {messengerLink && (
          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:border-accent hover:bg-accent-soft hover:text-accent"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M12 2C6.48 2 2 6.13 2 11.2c0 2.88 1.43 5.45 3.66 7.13V22l3.35-1.84c.89.25 1.83.38 2.79.38 5.52 0 10-4.13 10-9.2C22 6.13 17.52 2 12 2Zm1 12.4-2.55-2.72L5.4 14.4l5.6-5.95 2.6 2.72 5.05-2.72-5.65 5.95Z" />
            </svg>
            Message on Messenger
          </a>
        )}
      </div>

      {errorMessage ? (
        <ErrorState message={errorMessage} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Posts will appear here after the next refresh (every 15 minutes). If this page is rate-limited by Facebook, RSS-Bridge may return nothing."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
