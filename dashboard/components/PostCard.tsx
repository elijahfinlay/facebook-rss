import { timeAgo } from "@/lib/util";

export type PostCardData = {
  id: number;
  title: string;
  text: string;
  images: string[];
  publishedAt: Date | string;
  link: string;
};

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <article className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold leading-snug text-ink-900">
          {post.title || "Untitled post"}
        </h2>
        <time className="shrink-0 text-xs text-ink-300">
          {timeAgo(post.publishedAt)}
        </time>
      </header>

      {post.text && (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
          {post.text}
        </p>
      )}

      {post.images.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {post.images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl border border-ink-100 object-cover"
            />
          ))}
        </div>
      )}

      <footer className="mt-5 flex justify-end">
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition hover:text-accent-hover"
        >
          View on Facebook
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path d="M14 3v2h3.6l-9.3 9.3 1.4 1.4L19 6.4V10h2V3h-7Zm-9 4h6V5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6h-2v6H5V7Z" />
          </svg>
        </a>
      </footer>
    </article>
  );
}
