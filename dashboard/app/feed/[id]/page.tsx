import Link from "next/link";
import { listSubscriptions, streamContents } from "@/lib/freshrss";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { EmptyState, ErrorState } from "@/components/EmptyState";
import {
  extractFacebookUsername,
  extractImageSrcs,
  messengerUrl,
  stripHtml,
} from "@/lib/util";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FeedDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const streamId = decodeURIComponent(params.id);

  let feedTitle = "Feed";
  let username: string | null = null;
  let posts: PostCardData[] = [];
  let errorMessage: string | null = null;

  try {
    const [subs, stream] = await Promise.all([
      listSubscriptions(),
      streamContents(streamId, 30),
    ]);
    const sub = subs.find((s) => s.id === streamId);
    if (sub) {
      feedTitle = sub.title;
      username = extractFacebookUsername(sub.url, sub.htmlUrl, sub.title);
    }
    posts = stream.items.map((it) => ({
      id: it.id,
      title: it.title,
      text: stripHtml(it.summaryHtml, 1200),
      images: extractImageSrcs(it.summaryHtml, 4),
      published: it.published,
      link: it.canonicalUrl,
    }));
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
            {feedTitle}
          </h1>
          {username && (
            <p className="mt-1.5 text-sm text-ink-500">@{username}</p>
          )}
        </div>
        {username && (
          <a
            href={messengerUrl(username)}
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
          description="There are no posts in this feed yet. RSS-Bridge may still be fetching, or the page hasn't posted recently."
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
