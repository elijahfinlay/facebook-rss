"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "facebook" | "url";

export default function AddFeedPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("facebook");
  const [username, setUsername] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanUsername = username.trim().replace(/^@/, "");
  const usernameValid = /^[A-Za-z0-9.\-_]+$/.test(cleanUsername);
  const urlValid = /^https?:\/\/\S+/.test(rssUrl.trim());
  const valid = mode === "facebook" ? usernameValid : urlValid;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const body =
        mode === "facebook"
          ? { mode, username: cleanUsername }
          : { mode, rssUrl: rssUrl.trim(), name: name.trim() || undefined };
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
        Add a Feed
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Paste a Facebook page username, or any RSS/Atom URL.
      </p>

      <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <strong className="font-semibold">Heads up:</strong> Meta is currently
        blocking RSS-Bridge's FacebookBridge on every public instance, so
        Facebook-username feeds may fail with an upstream error. Direct RSS
        URLs (e.g. publishers' official feeds) work normally.
      </div>

      <div className="mt-4 inline-flex rounded-lg bg-surface-subtle p-1">
        <button
          type="button"
          onClick={() => setMode("facebook")}
          className={`min-h-[36px] rounded-md px-3 text-sm font-medium transition ${
            mode === "facebook"
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          Facebook page
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`min-h-[36px] rounded-md px-3 text-sm font-medium transition ${
            mode === "url"
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-500 hover:text-ink-900"
          }`}
        >
          RSS URL
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:p-6"
      >
        {mode === "facebook" ? (
          <>
            <label
              htmlFor="username"
              className="text-sm font-medium text-ink-900"
            >
              Page username
            </label>
            <div className="mt-2 flex min-h-[44px] items-stretch overflow-hidden rounded-md border border-ink-100 bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
              <span className="flex select-none items-center border-r border-ink-100 bg-surface-subtle px-3 text-sm text-ink-500">
                facebook.com /
              </span>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nytimes"
                autoFocus
                autoComplete="off"
                inputMode="text"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base text-ink-900 outline-none placeholder:text-ink-300 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-ink-500">
              Examples:{" "}
              <code className="rounded bg-surface-subtle px-1">nytimes</code>,{" "}
              <code className="rounded bg-surface-subtle px-1">BBCNews</code>,{" "}
              <code className="rounded bg-surface-subtle px-1">NPR</code>
            </p>
            {cleanUsername && usernameValid && (
              <div className="mt-4 break-all rounded-md bg-surface-subtle px-3 py-2 text-xs text-ink-500">
                <span className="font-medium text-ink-700">
                  Messenger link:
                </span>{" "}
                <code>https://m.me/{cleanUsername}</code>
              </div>
            )}
          </>
        ) : (
          <>
            <label
              htmlFor="rssUrl"
              className="text-sm font-medium text-ink-900"
            >
              RSS or Atom URL
            </label>
            <input
              id="rssUrl"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              placeholder="https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
              autoFocus
              autoComplete="off"
              inputMode="url"
              spellCheck={false}
              className="mt-2 block w-full min-w-0 rounded-md border border-ink-100 bg-white px-3 py-2.5 text-base text-ink-900 outline-none placeholder:text-ink-300 focus:border-accent focus:ring-2 focus:ring-accent/15 sm:text-sm"
            />

            <label
              htmlFor="name"
              className="mt-4 block text-sm font-medium text-ink-900"
            >
              Display name <span className="text-ink-300">(optional)</span>
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New York Times"
              autoComplete="off"
              className="mt-2 block w-full min-w-0 rounded-md border border-ink-100 bg-white px-3 py-2.5 text-base text-ink-900 outline-none placeholder:text-ink-300 focus:border-accent focus:ring-2 focus:ring-accent/15 sm:text-sm"
            />
            <p className="mt-2 text-xs text-ink-500">
              Any public RSS or Atom feed. If left blank, we'll use the
              hostname as the display name.
            </p>
          </>
        )}

        {error && (
          <div className="mt-4 break-words rounded-md border border-red-100 bg-red-50/50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || submitting}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
      </form>
    </div>
  );
}
