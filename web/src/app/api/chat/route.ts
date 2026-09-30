import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseActivityCsv, parseNotesJson } from "@/lib/data";
import { answerOwnerQuestion } from "@/lib/groq";
import { buildAgencySnapshot } from "@/lib/metrics";

type Body = {
  question?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
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
  const question = body?.question?.trim() || "";
  if (question.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Escribe una pregunta." },
      { status: 400 },
    );
  }
  if (question.length > 800) {
    return NextResponse.json(
      { ok: false, error: "La pregunta es demasiado larga." },
      { status: 400 },
    );
  }

  try {
    let snap = buildAgencySnapshot();
    let sourceLabel = "agencia actual";

    if (body?.csvText?.trim()) {
      const rows = parseActivityCsv(body.csvText);
      const notes = body.notesText?.trim()
        ? parseNotesJson(body.notesText)
        : undefined;
      snap = buildAgencySnapshot(rows, notes);
      sourceLabel = body.sourceLabel?.trim() || "archivo cargado";
    }

    const answer = await answerOwnerQuestion({
      snap,
      question,
      history: body?.history,
      sourceLabel,
    });

    if (!answer) {
      return NextResponse.json({
        ok: true,
        source: "fallback",
        answer:
          "Ahora mismo no pude consultar al asesor. Con lo que veo en el panel: prioriza conversaciones reales y citas reales sobre llamadas contestadas, y revisa agentes marcados con atención.",
      });
    }

    return NextResponse.json({ ok: true, source: "groq", answer });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No pudimos procesar la consulta.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
