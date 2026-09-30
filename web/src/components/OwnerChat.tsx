"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

type UploadState = {
  sourceLabel: string;
  csvText: string;
  notesText: string;
  summary?: {
    period: string;
    agents: number;
    realConversations: number;
    unprovenContact: number;
    realAppointments: number;
    sales: number;
    topInsight: string;
  };
};

const SUGGESTIONS = [
  "¿Quién necesita coaching esta semana?",
  "¿Qué métrica no debo creer?",
  "Compara a Carlos y Diego con honestidad",
  "¿Dónde estoy perdiendo dinero?",
];

export function OwnerChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Soy tu asesor Pulse. Pregúntame por tu equipo, citas, ventas o qué dato no debes creer. También puedes cargar otro CSV para analizarlo con las mismas reglas de confianza.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;

    const history = messages.filter((m) => m.role === "user" || m.role === "assistant");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: q,
          history: history.slice(-8),
          csvText: upload?.csvText,
          notesText: upload?.notesText,
          sourceLabel: upload?.sourceLabel,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || data.error || "No pude responder ahora.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Hubo un problema de conexión. Intenta de nuevo en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await ask(input);
  }

  async function onCsvSelected(file: File | null) {
    if (!file) return;
    setUploadError("");
    setAnalyzing(true);
    try {
      const csvText = await file.text();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          csvText,
          notesText: upload?.notesText || "",
          sourceLabel: file.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setUploadError(data.error || "No se pudo analizar el archivo.");
        return;
      }
      setUpload({
        sourceLabel: data.sourceLabel,
        csvText,
        notesText: data.notesText || "",
        summary: data.summary,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Listo: cargué “${data.sourceLabel}”. Periodo ${data.summary.period}. ${data.summary.agents} agentes, ${data.summary.realConversations} conversaciones reales, ${data.summary.sales} ventas. Lectura inicial: ${data.summary.topInsight} Pregúntame lo que quieras sobre este archivo.`,
        },
      ]);
    } catch {
      setUploadError("No pudimos leer ese archivo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function onNotesSelected(file: File | null) {
    if (!file) return;
    setUploadError("");
    try {
      const notesText = await file.text();
      JSON.parse(notesText);
      setUpload((prev) =>
        prev
          ? { ...prev, notesText }
          : {
              sourceLabel: "notas cargadas",
              csvText: "",
              notesText,
            },
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Notas de confianza cargadas. Si subes un CSV, las usaré para interpretar el archivo.",
        },
      ]);
    } catch {
      setUploadError("El JSON de notas no es válido.");
    }
  }

  return (
    <section id="chat" className="panel overflow-hidden rise">
      <div className="p-5 sm:p-6 border-b border-[var(--line)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label text-[var(--accent-2)]">Asesor conversacional</p>
            <h2 className="display text-2xl sm:text-3xl mt-1">Pregúntale a Pulse</h2>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-xl">
              Consulta tu agencia en lenguaje natural. También puedes cargar otro
              periodo o fuente CSV para analizarlo con las mismas reglas.
            </p>
          </div>
          <span className="chip">
            {upload?.csvText ? `Fuente: ${upload.sourceLabel}` : "Fuente: agencia actual"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <label className="chip cursor-pointer hover:text-[var(--paper)]">
            {analyzing ? "Analizando…" : "Cargar CSV"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={analyzing}
              onChange={(e) => onCsvSelected(e.target.files?.[0] || null)}
            />
          </label>
          <label className="chip cursor-pointer hover:text-[var(--paper)]">
            Notas JSON
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => onNotesSelected(e.target.files?.[0] || null)}
            />
          </label>
          {upload ? (
            <button
              type="button"
              className="chip hover:text-[var(--paper)]"
              onClick={() => setUpload(null)}
            >
              Volver a agencia actual
            </button>
          ) : null}
        </div>
        {uploadError ? (
          <p className="mt-2 text-sm text-[var(--danger)]">{uploadError}</p>
        ) : null}
        {upload?.summary ? (
          <div className="mt-3 rounded-2xl border border-[var(--line)] bg-black/20 p-3 text-sm text-[var(--muted)]">
            {upload.summary.realConversations} conversaciones reales ·{" "}
            {upload.summary.unprovenContact} sin prueba ·{" "}
            {upload.summary.realAppointments} citas · {upload.summary.sales} ventas
          </div>
        ) : null}
      </div>

      <div className="px-4 sm:px-6 py-4 max-h-[420px] overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--paper)] text-[var(--ink)]"
                  : "bg-white/5 border border-[var(--line)]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="text-sm text-[var(--muted)]">Pulse está pensando…</div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="chip whitespace-nowrap hover:text-[var(--paper)]"
            onClick={() => ask(s)}
            disabled={loading}
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="p-4 sm:p-5 border-t border-[var(--line)] flex gap-2 items-end"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="Ej: ¿A quién debo coachar mañana?"
          className="flex-1 resize-none rounded-2xl border border-[var(--line)] bg-black/25 px-4 py-3 outline-none focus:border-[var(--accent)] text-[15px]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-[var(--paper)] text-[var(--ink)] font-semibold px-5 py-3.5 min-h-12 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </section>
  );
}
