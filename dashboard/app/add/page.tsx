"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFeedPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = username.trim().replace(/^@/, "");
  const valid = /^[A-Za-z0-9.\-_]+$/.test(clean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feeds/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Add a Facebook Page
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Paste a Facebook page username. We'll generate the RSS-Bridge URL and
        subscribe you in FreshRSS.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card"
      >
        <label
          htmlFor="username"
          className="text-sm font-medium text-ink-900"
        >
          Page username
        </label>
        <div className="mt-2 flex items-center overflow-hidden rounded-md border border-ink-100 bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
          <span className="select-none border-r border-ink-100 bg-surface-subtle px-3 py-2 text-sm text-ink-500">
            facebook.com /
          </span>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nytimes"
            autoFocus
            autoComplete="off"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-300"
          />
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Examples: <code className="rounded bg-surface-subtle px-1">nytimes</code>,{" "}
          <code className="rounded bg-surface-subtle px-1">BBCNews</code>,{" "}
          <code className="rounded bg-surface-subtle px-1">NPR</code>
        </p>

        {clean && valid && (
          <div className="mt-4 rounded-md bg-surface-subtle px-3 py-2 text-xs text-ink-500">
            <span className="font-medium text-ink-700">Messenger link:</span>{" "}
            <code>https://m.me/{clean}</code>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-red-100 bg-red-50/50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
      </form>
    </div>
  );
}
