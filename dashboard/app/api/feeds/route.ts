import { NextResponse } from "next/server";
import { listSubscriptions, unreadCounts } from "@/lib/freshrss";
import { extractFacebookUsername } from "@/lib/util";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [subs, counts] = await Promise.all([
      listSubscriptions(),
      unreadCounts(),
    ]);
    return NextResponse.json({
      feeds: subs.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        htmlUrl: s.htmlUrl,
        iconUrl: s.iconUrl,
        unread: counts[s.id] ?? 0,
        username: extractFacebookUsername(s.url, s.htmlUrl, s.title),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
