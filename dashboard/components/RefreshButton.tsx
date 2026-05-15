"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cron/refresh", { method: "POST" });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        refreshed?: number;
        failed?: number;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 items-center gap-3 sm:flex-none">
      {error && (
        <span className="truncate text-xs text-red-600" title={error}>
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-100 bg-white px-3 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:border-accent hover:bg-accent-soft hover:text-accent disabled:opacity-50 sm:flex-none"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
          aria-hidden
        >
          <path d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.07A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z" />
        </svg>
        {busy ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
