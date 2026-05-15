import Link from "next/link";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-100 bg-white px-8 py-16 text-center">
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/50 px-6 py-5 text-sm text-red-700">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1 text-red-600/90">{message}</p>
      <p className="mt-3 text-xs text-red-500">
        Double-check your <code className="rounded bg-white px-1 py-0.5">.env.local</code>{" "}
        values and that FreshRSS is running.
      </p>
    </div>
  );
}
