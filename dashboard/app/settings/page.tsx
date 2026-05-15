import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { FeedRow, type FeedRowData } from "@/components/FeedRow";
import { ErrorState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const rssBridge =
    process.env.RSS_BRIDGE_URL ?? "https://rss-bridge.org/bridge01";
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  const cronSecretConfigured = Boolean(process.env.CRON_SECRET);

  let feeds: FeedRowData[] = [];
  let errorMessage: string | null = null;
  try {
    const rows = await db
      .select({
        id: schema.feeds.id,
        name: schema.feeds.name,
        username: schema.feeds.username,
        rssUrl: schema.feeds.rssUrl,
      })
      .from(schema.feeds)
      .orderBy(desc(schema.feeds.createdAt));
    feeds = rows;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
        Settings
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Connection status and feed management.
      </p>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-card sm:mt-8 sm:p-6">
        <h2 className="text-base font-semibold text-ink-900">Connections</h2>
        <p className="mt-1 text-sm text-ink-500">
          Set environment variables on Vercel or in{" "}
          <code className="rounded bg-surface-subtle px-1">.env.local</code>.
        </p>

        <dl className="mt-5 divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100">
          <Row
            label="Neon database"
            envKey="DATABASE_URL"
            value={dbConfigured ? "connected" : "(not set)"}
            ok={dbConfigured}
          />
          <Row
            label="RSS-Bridge instance"
            envKey="RSS_BRIDGE_URL"
            value={rssBridge}
            ok
          />
          <Row
            label="Cron secret"
            envKey="CRON_SECRET"
            value={cronSecretConfigured ? "set" : "(not set — recommended)"}
            ok={cronSecretConfigured}
          />
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-ink-100 bg-white shadow-card sm:mt-8">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-semibold text-ink-900">
            Subscribed Feeds
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {feeds.length} feed{feeds.length === 1 ? "" : "s"} subscribed.
          </p>
        </div>
        {errorMessage ? (
          <div className="p-6">
            <ErrorState message={errorMessage} />
          </div>
        ) : feeds.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-500">
            No feeds yet.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {feeds.map((feed) => (
              <FeedRow key={feed.id} feed={feed} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  envKey,
  ok,
}: {
  label: string;
  value: string;
  envKey: string;
  ok?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <div className="min-w-0">
        <dt className="flex items-center gap-2 text-sm font-medium text-ink-900">
          <span
            className={`inline-block h-2 w-2 shrink-0 rounded-full ${
              ok ? "bg-emerald-500" : "bg-amber-400"
            }`}
            aria-hidden
          />
          {label}
        </dt>
        <dd className="ml-4 mt-0.5 text-xs text-ink-300">{envKey}</dd>
      </div>
      <code className="block max-w-full truncate rounded bg-surface-subtle px-2 py-1 text-xs text-ink-700 sm:max-w-[60%]">
        {value}
      </code>
    </div>
  );
}
