"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type FeedRowData = {
  id: number;
  name: string;
  username: string;
  rssUrl: string;
};

export function FeedRow({ feed }: { feed: FeedRowData }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRemove() {
    if (!confirm(`Remove "${feed.name}"?`)) return;
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/feeds/${feed.id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setRemoving(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{feed.name}</p>
        <p className="truncate text-xs text-ink-500">@{feed.username}</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-md border border-ink-100 bg-white px-3 py-2 text-xs font-medium text-ink-700 transition hover:border-red-200 hover:bg-red-50/60 hover:text-red-700 disabled:opacity-50"
      >
        {removing ? "Removing…" : "Remove"}
      </button>
    </li>
  );
}
