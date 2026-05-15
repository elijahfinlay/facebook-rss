import { NextResponse } from "next/server";
import { streamContents } from "@/lib/freshrss";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");
  const count = Number(searchParams.get("n") ?? "20");
  if (!streamId) {
    return NextResponse.json(
      { error: "Missing streamId." },
      { status: 400 },
    );
  }
  try {
    const result = await streamContents(streamId, count);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
