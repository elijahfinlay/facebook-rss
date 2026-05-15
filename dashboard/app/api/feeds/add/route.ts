import { NextResponse } from "next/server";
import { quickAdd } from "@/lib/freshrss";
import { bridgeFacebookUrl } from "@/lib/util";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      username?: string;
      feedUrl?: string;
      rssBridgeUrl?: string;
    };

    let feedUrl = body.feedUrl?.trim();
    if (!feedUrl && body.username) {
      const username = body.username.trim().replace(/^@/, "");
      if (!/^[A-Za-z0-9.\-_]+$/.test(username)) {
        return NextResponse.json(
          { error: "Invalid Facebook page username." },
          { status: 400 },
        );
      }
      const base =
        body.rssBridgeUrl?.trim() ||
        process.env.RSS_BRIDGE_URL ||
        "http://localhost:3000";
      feedUrl = bridgeFacebookUrl(base, username);
    }

    if (!feedUrl) {
      return NextResponse.json(
        { error: "Provide either `username` or `feedUrl`." },
        { status: 400 },
      );
    }

    await quickAdd(feedUrl);
    return NextResponse.json({ ok: true, feedUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
