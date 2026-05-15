import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { refreshFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const feeds = await db
    .select({ id: schema.feeds.id, username: schema.feeds.username })
    .from(schema.feeds);

  const results = await Promise.all(
    feeds.map(async (f) => {
      try {
        const inserted = await refreshFeed(f.id);
        return { id: f.id, username: f.username, inserted, ok: true as const };
      } catch (err) {
        return {
          id: f.id,
          username: f.username,
          ok: false as const,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }),
  );

  return NextResponse.json({
    ok: true,
    refreshed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}
