import Link from "next/link";

export type FeedCardData = {
  id: number;
  name: string;
  username: string;
  messengerUrl: string;
  unread: number;
  previewText?: string;
  previewTimeAgo?: string;
};

export function FeedCard({ feed }: { feed: FeedCardData }) {
  const initial = feed.name.trim().charAt(0).toUpperCase() || "F";
  const href = `/feed/${feed.id}`;
  return (
    <div className="group relative flex flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover">
      <Link href={href} className="absolute inset-0 z-0" aria-label={feed.name} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-sm font-semibold text-accent">
            {initial}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-ink-900">
              {feed.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-500">
              @{feed.username}
            </p>
          </div>
        </div>
        {feed.unread > 0 && (
          <span className="z-10 inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent px-2 text-[11px] font-semibold text-white">
            {feed.unread > 999 ? "999+" : feed.unread}
          </span>
        )}
      </div>

      <p className="mt-4 line-clamp-3 min-h-[3.6rem] text-sm leading-relaxed text-ink-500">
        {feed.previewText || "No recent posts yet."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
        <span className="text-xs text-ink-300">
          {feed.previewTimeAgo ?? "—"}
        </span>
        <a
          href={feed.messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition hover:border-accent hover:bg-accent-soft hover:text-accent"
          onClick={(e) => e.stopPropagation()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path d="M12 2C6.48 2 2 6.13 2 11.2c0 2.88 1.43 5.45 3.66 7.13V22l3.35-1.84c.89.25 1.83.38 2.79.38 5.52 0 10-4.13 10-9.2C22 6.13 17.52 2 12 2Zm1 12.4-2.55-2.72L5.4 14.4l5.6-5.95 2.6 2.72 5.05-2.72-5.65 5.95Z" />
          </svg>
          Message
        </a>
      </div>
    </div>
  );
}
