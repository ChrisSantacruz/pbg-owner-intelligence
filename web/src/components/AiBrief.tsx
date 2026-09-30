"use client";

import { useEffect, useState } from "react";

export function AiBrief() {
  const [brief, setBrief] = useState("Preparando tu resumen de hoy…");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setBrief(d.brief || "Aún no hay resumen disponible.");
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setBrief("No pudimos generar el resumen en este momento.");
        setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="asesor" className="panel p-5 sm:p-7 rise">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label text-[var(--accent-2)]">Asesor Pulse</p>
          <h2 className="display text-2xl sm:text-3xl mt-1">
            Qué hacer esta semana
          </h2>
        </div>
        <span className="chip">{ready ? "Actualizado" : "Cargando"}</span>
      </div>
      <div className="mt-4 text-[15px] leading-relaxed text-[var(--paper)]/92 whitespace-pre-wrap">
        {brief}
      </div>
    </section>
  );
}
