import { NextResponse } from "next/server";
import { unsubscribe } from "@/lib/freshrss";

export async function POST(req: Request) {
  try {
    const { streamId } = (await req.json()) as { streamId?: string };
    if (!streamId) {
      return NextResponse.json(
        { error: "Missing streamId." },
        { status: 400 },
      );
    }
    await unsubscribe(streamId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
