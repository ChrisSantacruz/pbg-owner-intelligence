"use client";

import { useMemo, useState } from "react";
import type { AgentStats } from "@/lib/types";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function AgentBoard({ agents }: { agents: AgentStats[] }) {
  const [selected, setSelected] = useState(agents[0]?.agent ?? "");
  const agent = useMemo(
    () => agents.find((a) => a.agent === selected) ?? agents[0],
    [agents, selected],
  );
  const maxConfirmed = Math.max(...agents.map((a) => a.confirmedConversations), 1);

  if (!agent) return null;

  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
      <div className="panel p-5 overflow-x-auto">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h3 className="display text-2xl">Agentes (solo personas)</h3>
            <p className="text-sm text-[var(--muted)] mt-1">
              Ranking por ventas, con conversaciones confirmadas como ancla de
              calidad.
            </p>
          </div>
        </div>
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-[var(--muted)] text-left">
            <tr className="border-b border-[var(--line)]">
              <th className="py-3 font-medium">Agente</th>
              <th className="py-3 font-medium">Confirmadas</th>
              <th className="py-3 font-medium">Inflado</th>
              <th className="py-3 font-medium">Citas reales</th>
              <th className="py-3 font-medium">Ventas</th>
              <th className="py-3 font-medium">Ad spend</th>
              <th className="py-3 font-medium">Señal</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr
                key={a.agent}
                onClick={() => setSelected(a.agent)}
                className={`border-b border-[var(--line)]/70 cursor-pointer transition ${
                  a.agent === agent.agent
                    ? "bg-white/5"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <td className="py-3 pr-3 font-medium">
                  {a.agent}
                  {a.trustFlags.length > 0 ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--accent)]">
                      flagged
                    </span>
                  ) : null}
                </td>
                <td className="py-3">{a.confirmedConversations}</td>
                <td className="py-3 text-[var(--danger)]">{a.inflatedContacts}</td>
                <td className="py-3">{a.trueAppointments}</td>
                <td className="py-3">{a.sales}</td>
                <td className="py-3">{money(a.adSpend)}</td>
                <td className="py-3 w-36">
                  <div className="bar">
                    <span
                      style={{
                        width: `${(a.confirmedConversations / maxConfirmed) * 100}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="panel p-6 rise">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Drill-down
        </p>
        <h3 className="display text-3xl mt-2">{agent.agent}</h3>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Dials</dt>
            <dd>{agent.dials}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Carrier answered</dt>
            <dd className="trust-low">{agent.carrierAnswered}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Conversaciones confirmadas</dt>
            <dd className="trust-high">{agent.confirmedConversations}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Tasa confirmación / answered</dt>
            <dd>{(agent.confirmationRate * 100).toFixed(0)}%</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Citas reales</dt>
            <dd>{agent.trueAppointments}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Callbacks (no son citas)</dt>
            <dd>{agent.callbackFlags}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Applications / Sales</dt>
            <dd>
              {agent.applications} / {agent.sales}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Coste / venta</dt>
            <dd>
              {agent.costPerSale != null ? money(agent.costPerSale) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Premium pantalla (suma)</dt>
            <dd className="trust-medium">{money(agent.premiumScreen)}</dd>
          </div>
        </dl>

        {agent.trustFlags.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
              Advertencias de confianza
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--paper)]/90">
              {agent.trustFlags.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 text-sm text-[var(--muted)]">
            Sin flags estructurales en este agente. Sigue validando coaching con
            conversaciones confirmadas, no con dials.
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-[var(--line)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent-2)]">
            Acción sugerida
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            {agent.inflatedContacts >= 5
              ? `Prioriza coaching de calificación con ${agent.agent}: alto contacto inflado (${agent.inflatedContacts}) frente a ${agent.confirmedConversations} conversaciones confirmadas.`
              : agent.sales === 0 && agent.confirmedConversations >= 4
                ? `${agent.agent} genera conversaciones pero no cierra. Revisa script de cierre y follow-up, no volumen.`
                : `${agent.agent} está en zona razonable. Mantén el foco en citas reales y coste por venta (${agent.costPerSale != null ? money(agent.costPerSale) : "n/a"}).`}
          </p>
        </div>
      </aside>
    </div>
  );
}
