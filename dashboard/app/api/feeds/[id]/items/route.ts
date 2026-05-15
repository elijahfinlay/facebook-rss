import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const feedId = Number(params.id);
  if (!Number.isFinite(feedId) || feedId <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "30"), 100);
  const markRead = searchParams.get("markRead") === "1";

  try {
    const rows = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.feedId, feedId))
      .orderBy(desc(schema.items.publishedAt))
      .limit(limit);

    if (markRead && rows.length > 0) {
      await db
        .update(schema.items)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.items.feedId, feedId),
            eq(schema.items.isRead, false),
          ),
        );
    }

    return NextResponse.json({ items: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const feedId = Number(params.id);
  if (!Number.isFinite(feedId) || feedId <= 0) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as {
      action?: "markAllRead";
    };
    if (body.action === "markAllRead") {
      await db
        .update(schema.items)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.items.feedId, feedId),
            eq(schema.items.isRead, false),
          ),
        );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
