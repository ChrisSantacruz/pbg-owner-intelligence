"use client";

import { useEffect, useState } from "react";

export function AiBrief() {
  const [brief, setBrief] = useState("Generando briefing con Groq…");
  const [source, setSource] = useState<"groq" | "heuristic" | "loading">("loading");

  useEffect(() => {
    let alive = true;
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setBrief(d.brief || "No hay briefing disponible.");
        setSource(d.source === "groq" ? "groq" : "heuristic");
      })
      .catch(() => {
        if (!alive) return;
        setBrief("No se pudo generar el briefing ahora.");
        setSource("heuristic");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mt-5 panel p-6 rise">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-2)]">
            Briefing del dueño
          </p>
          <h2 className="display text-2xl mt-1">Pulse AI</h2>
        </div>
        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] border border-[var(--line)] rounded-full px-3 py-1">
          {source === "loading" ? "…" : source === "groq" ? "Groq" : "Heurístico"}
        </span>
      </div>
      <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--paper)]/90">
        {brief}
      </pre>
    </section>
  );
}
