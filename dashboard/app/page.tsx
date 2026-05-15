import Link from "next/link";
import {
  listSubscriptions,
  streamContents,
  unreadCounts,
} from "@/lib/freshrss";
import { FeedCard, type FeedCardData } from "@/components/FeedCard";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import { extractFacebookUsername, stripHtml, timeAgo } from "@/lib/util";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedsPage() {
  let cards: FeedCardData[] = [];
  let errorMessage: string | null = null;

  try {
    const [subs, counts] = await Promise.all([
      listSubscriptions(),
      unreadCounts(),
    ]);

    const previews = await Promise.all(
      subs.map(async (s) => {
        try {
          const { items } = await streamContents(s.id, 1);
          return items[0] ?? null;
        } catch {
          return null;
        }
      }),
    );

    cards = subs.map((s, i) => {
      const preview = previews[i];
      return {
        id: s.id,
        title: s.title,
        unread: counts[s.id] ?? 0,
        username: extractFacebookUsername(s.url, s.htmlUrl, s.title),
        previewText: preview ? stripHtml(preview.summaryHtml, 180) : undefined,
        previewTimeAgo: preview ? timeAgo(preview.published) : undefined,
      };
    });
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
          description="Add a Facebook page to start tracking it. We'll pull posts via RSS-Bridge and surface them here."
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
