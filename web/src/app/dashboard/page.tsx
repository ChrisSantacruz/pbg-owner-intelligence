import { AiBrief } from "@/components/AiBrief";
import { LogoutButton } from "@/components/LogoutButton";
import { AgentBoard } from "@/components/AgentBoard";
import { getSession } from "@/lib/auth";
import { buildAgencySnapshot } from "@/lib/metrics";
import { redirect } from "next/navigation";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const snap = buildAgencySnapshot();
  const t = snap.totals;
  const answeredSessionsProxy = t.confirmedConversations + t.inflatedContacts;
  const signalGap =
    answeredSessionsProxy > 0
      ? Math.round((t.inflatedContacts / answeredSessionsProxy) * 100)
      : 0;

  return (
    <main className="min-h-screen px-4 sm:px-8 py-8 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 rise">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-[var(--muted)]">
            PBG · Pulse
          </p>
          <h1 className="display text-4xl sm:text-5xl mt-1">
            Inteligencia del dueño
          </h1>
          <p className="text-[var(--muted)] mt-2">
            Hola, {session.name}. Periodo {snap.rangeLabel}. Datos sintéticos.
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="mt-8 panel p-6 sm:p-8 rise rise-delay-1">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
          Insight principal
        </p>
        <p className="display text-2xl sm:text-3xl mt-3 max-w-4xl leading-snug">
          {snap.insights[0]}
        </p>
        <p className="mt-4 text-[var(--muted)] max-w-3xl">
          ~{signalGap}% del contacto con señal de carrier no supera la regla de
          conversación confirmada. Si optimizas por “answered”, estás optimizando
          ruido.
        </p>
      </section>

      <section className="mt-5 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 rise rise-delay-2">
        {[
          {
            label: "Conversaciones confirmadas",
            value: String(t.confirmedConversations),
            hint: "Alta confianza",
            tone: "trust-high",
          },
          {
            label: "Contacto inflado",
            value: String(t.inflatedContacts),
            hint: "Answered sin prueba",
            tone: "trust-low",
          },
          {
            label: "Citas reales",
            value: String(t.trueAppointments),
            hint: "Callbacks excluidos",
            tone: "trust-high",
          },
          {
            label: "Ventas / Ad spend",
            value: `${t.sales} · ${money(t.adSpend)}`,
            hint: "Negocio, no vanity",
            tone: "",
          },
        ].map((k) => (
          <div key={k.label} className="panel p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              {k.label}
            </p>
            <p className={`display text-3xl mt-3 ${k.tone}`}>{k.value}</p>
            <p className="text-sm text-[var(--muted)] mt-2">{k.hint}</p>
          </div>
        ))}
      </section>

      <section className="mt-5 grid lg:grid-cols-[0.9fr_1.1fr] gap-4 rise rise-delay-3">
        <div className="panel p-6">
          <h2 className="display text-2xl">Señal vs ruido</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            Carrier answered se muestra, pero no gobierna el panel.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Confirmadas</span>
                <span className="trust-high">{t.confirmedConversations}</span>
              </div>
              <div className="bar">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      (t.confirmedConversations /
                        Math.max(1, t.confirmedConversations + t.inflatedContacts)) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Inflado</span>
                <span className="trust-low">{t.inflatedContacts}</span>
              </div>
              <div className="bar">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      (t.inflatedContacts /
                        Math.max(1, t.confirmedConversations + t.inflatedContacts)) *
                        100,
                    )}%`,
                    background:
                      "linear-gradient(90deg, #e07a5f, #d7a13a)",
                  }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] p-4 text-sm text-[var(--muted)]">
              Totales de negocio excluyen <strong className="text-[var(--paper)]">PBG Billing</strong>{" "}
              (cuenta no humana). Premium pantalla: {money(t.premiumScreen)}{" "}
              (confianza media).
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="display text-2xl">Definición de métricas</h2>
          <ul className="mt-4 space-y-3">
            {snap.metricDefs.map((m) => (
              <li
                key={m.id}
                className="border-b border-[var(--line)]/60 pb-3 last:border-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{m.label}</p>
                  <span className={`text-xs uppercase tracking-wider trust-${m.trust}`}>
                    {m.trust}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)] mt-1">{m.definition}</p>
                {m.caveat ? (
                  <p className="text-xs text-[var(--accent)] mt-1">{m.caveat}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AiBrief />

      <section className="mt-5">
        <AgentBoard agents={snap.agents} />
      </section>

      <section className="mt-5 grid lg:grid-cols-2 gap-4">
        <div className="panel p-6">
          <h2 className="display text-2xl">Lecturas del negocio</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--paper)]/90">
            {snap.insights.map((i) => (
              <li key={i} className="leading-relaxed">
                • {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="display text-2xl">Advertencias del dataset</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            {snap.dataWarnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-10 mb-6 text-xs text-[var(--muted)]">
        Pulse MVP · JWT demo auth · métricas definidas antes de visualizar · sin
        datos reales de clientes.
      </footer>
    </main>
  );
}
