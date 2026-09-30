import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseActivityCsv, parseNotesJson } from "@/lib/data";
import { buildAgencySnapshot } from "@/lib/metrics";
import { snapshotToContext } from "@/lib/snapshotContext";

type Body = {
  csvText?: string;
  notesText?: string;
  sourceLabel?: string;
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.csvText?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Sube un CSV de actividad para analizar." },
      { status: 400 },
    );
  }

  try {
    const rows = parseActivityCsv(body.csvText);
    const notes = body.notesText?.trim()
      ? parseNotesJson(body.notesText)
      : undefined;
    const snap = buildAgencySnapshot(rows, notes);
    const label = body.sourceLabel?.trim() || "archivo cargado";

    return NextResponse.json({
      ok: true,
      sourceLabel: label,
      summary: {
        period: snap.rangeLabel,
        agents: snap.agents.length,
        realConversations: snap.totals.confirmedConversations,
        unprovenContact: snap.totals.inflatedContacts,
        realAppointments: snap.totals.trueAppointments,
        sales: snap.totals.sales,
        topInsight: snap.insights[0],
      },
      context: snapshotToContext(snap, label),
      csvText: body.csvText,
      notesText: body.notesText || "",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No pudimos leer el archivo.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
