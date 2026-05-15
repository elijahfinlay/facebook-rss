import { listSubscriptions } from "@/lib/freshrss";
import { FeedRow, type FeedRowData } from "@/components/FeedRow";
import { ErrorState } from "@/components/EmptyState";
import { extractFacebookUsername } from "@/lib/util";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const freshRssUrl = process.env.FRESHRSS_URL ?? "http://localhost:8080";
  const rssBridgeUrl = process.env.RSS_BRIDGE_URL ?? "http://localhost:3000";
  const user = process.env.FRESHRSS_USER ?? "";

  let feeds: FeedRowData[] = [];
  let errorMessage: string | null = null;
  try {
    const subs = await listSubscriptions();
    feeds = subs.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      username: extractFacebookUsername(s.url, s.htmlUrl, s.title),
    }));
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Settings
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Configure connection details and manage your subscribed feeds.
      </p>

      <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-ink-900">Connections</h2>
        <p className="mt-1 text-sm text-ink-500">
          Edit these values in{" "}
          <code className="rounded bg-surface-subtle px-1">.env.local</code>{" "}
          and restart the dashboard.
        </p>

        <dl className="mt-5 divide-y divide-ink-100 rounded-xl border border-ink-100">
          <Row label="FreshRSS URL" value={freshRssUrl} envKey="FRESHRSS_URL" />
          <Row label="RSS-Bridge URL" value={rssBridgeUrl} envKey="RSS_BRIDGE_URL" />
          <Row label="FreshRSS user" value={user || "(not set)"} envKey="FRESHRSS_USER" />
          <Row
            label="FreshRSS password"
            value={process.env.FRESHRSS_PASS ? "••••••••" : "(not set)"}
            envKey="FRESHRSS_PASS"
          />
        </dl>
      </section>

      <section className="mt-8 rounded-2xl border border-ink-100 bg-white shadow-card">
        <div className="border-b border-ink-100 px-6 py-5">
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
}: {
  label: string;
  value: string;
  envKey: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div>
        <dt className="text-sm font-medium text-ink-900">{label}</dt>
        <dd className="mt-0.5 text-xs text-ink-300">{envKey}</dd>
      </div>
      <code className="max-w-[60%] truncate rounded bg-surface-subtle px-2 py-1 text-xs text-ink-700">
        {value}
      </code>
    </div>
  );
}
