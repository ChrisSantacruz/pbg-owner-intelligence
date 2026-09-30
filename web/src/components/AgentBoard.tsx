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

function actionFor(agent: AgentStats) {
  if (agent.inflatedContacts >= 5) {
    return `Agenda coaching de calificación con ${agent.agent}: hay mucho contacto sin conversación real.`;
  }
  if (agent.sales === 0 && agent.confirmedConversations >= 4) {
    return `${agent.agent} conversa bien pero no cierra. Revisa el cierre y el follow-up, no el volumen.`;
  }
  return `Mantén a ${agent.agent} enfocado en citas reales y costo por venta${
    agent.costPerSale != null ? ` (${money(agent.costPerSale)})` : ""
  }.`;
}

export function AgentBoard({ agents }: { agents: AgentStats[] }) {
  const [selected, setSelected] = useState(agents[0]?.agent ?? "");
  const agent = useMemo(
    () => agents.find((a) => a.agent === selected) ?? agents[0],
    [agents, selected],
  );
  const maxConfirmed = Math.max(
    ...agents.map((a) => a.confirmedConversations),
    1,
  );

  if (!agent) return null;

  return (
    <div id="equipo" className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-5">
      <div className="panel p-4 sm:p-6">
        <h3 className="display text-2xl sm:text-3xl">Tu equipo</h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Ordenado por ventas. La calidad se mide en conversaciones reales.
        </p>

        {/* Mobile cards */}
        <div className="mt-4 grid gap-2.5 lg:hidden">
          {agents.map((a) => (
            <button
              key={a.agent}
              type="button"
              className={`agent-card ${a.agent === agent.agent ? "active" : ""}`}
              onClick={() => setSelected(a.agent)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[15px]">{a.agent}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {a.sales} ventas · {a.confirmedConversations} conversaciones
                  </p>
                </div>
                {a.trustFlags.length > 0 ? (
                  <span className="chip text-[var(--accent)] border-[var(--accent)]/30">
                    Revisar
                  </span>
                ) : (
                  <span className="text-sm font-medium">{money(a.adSpend)}</span>
                )}
              </div>
              <div className="bar mt-3">
                <span
                  style={{
                    width: `${(a.confirmedConversations / maxConfirmed) * 100}%`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="mt-5 hidden lg:block overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="text-[var(--muted)] text-left">
              <tr className="border-b border-[var(--line)]">
                <th className="py-3 font-medium">Agente</th>
                <th className="py-3 font-medium">Conversaciones</th>
                <th className="py-3 font-medium">Sin prueba</th>
                <th className="py-3 font-medium">Citas</th>
                <th className="py-3 font-medium">Ventas</th>
                <th className="py-3 font-medium">Inversión</th>
                <th className="py-3 font-medium">Calidad</th>
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
                  <td className="py-3.5 pr-3 font-medium">
                    {a.agent}
                    {a.trustFlags.length > 0 ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--accent)]">
                        revisar
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3.5">{a.confirmedConversations}</td>
                  <td className="py-3.5 text-[var(--danger)]">
                    {a.inflatedContacts}
                  </td>
                  <td className="py-3.5">{a.trueAppointments}</td>
                  <td className="py-3.5">{a.sales}</td>
                  <td className="py-3.5">{money(a.adSpend)}</td>
                  <td className="py-3.5 w-36">
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
      </div>

      <aside className="panel p-5 sm:p-6">
        <p className="section-label">Perfil del agente</p>
        <h3 className="display text-3xl mt-1">{agent.agent}</h3>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            {
              label: "Conversaciones reales",
              value: String(agent.confirmedConversations),
              tone: "trust-high",
            },
            {
              label: "Citas reales",
              value: String(agent.trueAppointments),
              tone: "trust-high",
            },
            {
              label: "Ventas",
              value: String(agent.sales),
              tone: "",
            },
            {
              label: "Costo / venta",
              value:
                agent.costPerSale != null ? money(agent.costPerSale) : "—",
              tone: "",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--line)] bg-black/15 p-3.5"
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {item.label}
              </p>
              <p className={`display text-2xl mt-1 ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Marcaciones</dt>
            <dd>{agent.dials}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Contestadas (solo señal)</dt>
            <dd className="trust-low">{agent.carrierAnswered}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Calidad del contacto</dt>
            <dd>{(agent.confirmationRate * 100).toFixed(0)}%</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Callbacks (no son citas)</dt>
            <dd>{agent.callbackFlags}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--muted)]">Solicitudes</dt>
            <dd>{agent.applications}</dd>
          </div>
        </dl>

        {agent.trustFlags.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
              Atención
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--paper)]/90">
              {agent.trustFlags.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-[var(--line)] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent-2)]">
            Próximo paso
          </p>
          <p className="mt-2 text-sm leading-relaxed">{actionFor(agent)}</p>
        </div>
      </aside>
    </div>
  );
}
