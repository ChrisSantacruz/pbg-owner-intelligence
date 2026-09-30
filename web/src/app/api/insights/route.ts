import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateOwnerBrief } from "@/lib/groq";
import { buildAgencySnapshot } from "@/lib/metrics";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snap = buildAgencySnapshot();
  const brief = await generateOwnerBrief(snap);

  if (!brief) {
    return NextResponse.json({
      ok: true,
      source: "heuristic",
      brief: snap.insights.slice(0, 3).map((i) => `• ${i}`).join("\n"),
    });
  }

  return NextResponse.json({ ok: true, source: "groq", brief });
}
