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

function trustLabel(trust: "high" | "medium" | "low") {
  if (trust === "high") return "Confiable";
  if (trust === "medium") return "Usar con cuidado";
  return "No usar solo";
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
    <main className="shell">
      <header className="flex flex-wrap items-start justify-between gap-4 rise">
        <div className="min-w-0">
          <p className="section-label">PBG · Pulse</p>
          <h1 className="display text-[2rem] sm:text-5xl mt-1 leading-tight">
            Tu agencia, en claro
          </h1>
          <p className="text-[var(--muted)] mt-2 text-sm sm:text-base">
            Hola, {session.name}. Periodo {snap.rangeLabel}.
          </p>
        </div>
        <LogoutButton />
      </header>

      <nav className="mobile-nav lg:hidden" aria-label="Secciones">
        <a href="#resumen">Resumen</a>
        <a href="#asesor">Asesor</a>
        <a href="#calidad">Calidad</a>
        <a href="#equipo">Equipo</a>
        <a href="#alertas">Alertas</a>
      </nav>

      <section id="resumen" className="mt-2 sm:mt-8 panel p-5 sm:p-8 rise rise-delay-1">
        <p className="section-label text-[var(--accent)]">Resumen ejecutivo</p>
        <p className="display text-[1.45rem] sm:text-3xl mt-3 max-w-4xl leading-snug">
          {snap.insights[0]}
        </p>
        <p className="mt-4 text-sm sm:text-base text-[var(--muted)] max-w-3xl leading-relaxed">
          Casi {signalGap}% del contacto “contestado” no tiene conversación real.
          Si decides por ese número, estás dirigiendo ruido.
        </p>
      </section>

      <section className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 rise rise-delay-2">
        {[
          {
            label: "Conversaciones reales",
            value: String(t.confirmedConversations),
            hint: "Lo que sí cuenta",
            tone: "trust-high",
          },
          {
            label: "Sin prueba",
            value: String(t.inflatedContacts),
            hint: "Parece contacto, no lo es",
            tone: "trust-low",
          },
          {
            label: "Citas reales",
            value: String(t.trueAppointments),
            hint: "Sin callbacks",
            tone: "trust-high",
          },
          {
            label: "Ventas",
            value: `${t.sales}`,
            hint: `Inversión ${money(t.adSpend)}`,
            tone: "",
          },
        ].map((k) => (
          <div key={k.label} className="panel p-4 sm:p-5">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.14em] text-[var(--muted)] leading-snug">
              {k.label}
            </p>
            <p className={`display text-2xl sm:text-3xl mt-2 ${k.tone}`}>
              {k.value}
            </p>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">{k.hint}</p>
          </div>
        ))}
      </section>

      <div className="mt-4 sm:mt-5">
        <AiBrief />
      </div>

      <section
        id="calidad"
        className="mt-4 sm:mt-5 grid lg:grid-cols-2 gap-3 sm:gap-4 rise rise-delay-3"
      >
        <div className="panel p-5 sm:p-6">
          <h2 className="display text-2xl sm:text-3xl">Calidad del contacto</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            Separación clara entre lo real y lo que solo parece actividad.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Conversaciones reales</span>
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
                <span>Contacto sin prueba</span>
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
                    background: "linear-gradient(90deg, #e07a5f, #d7a13a)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <h2 className="display text-2xl sm:text-3xl">Cómo leemos tu negocio</h2>
          <ul className="mt-4 space-y-3">
            {snap.metricDefs.map((m) => (
              <li
                key={m.id}
                className="border-b border-[var(--line)]/60 pb-3 last:border-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[15px]">{m.label}</p>
                  <span className={`text-[11px] uppercase tracking-wider trust-${m.trust}`}>
                    {trustLabel(m.trust)}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
                  {m.definition}
                </p>
                {m.caveat ? (
                  <p className="text-xs text-[var(--accent)] mt-1">{m.caveat}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-4 sm:mt-5">
        <AgentBoard agents={snap.agents} />
      </section>

      <section
        id="alertas"
        className="mt-4 sm:mt-5 grid lg:grid-cols-2 gap-3 sm:gap-4"
      >
        <div className="panel p-5 sm:p-6">
          <h2 className="display text-2xl sm:text-3xl">Lecturas clave</h2>
          <ul className="mt-4 space-y-3 text-sm sm:text-[15px] text-[var(--paper)]/90">
            {snap.insights.map((i) => (
              <li key={i} className="leading-relaxed">
                • {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-5 sm:p-6">
          <h2 className="display text-2xl sm:text-3xl">Qué vigilar</h2>
          <ul className="mt-4 space-y-3 text-sm sm:text-[15px] text-[var(--muted)]">
            {snap.dataWarnings.map((w) => (
              <li key={w} className="leading-relaxed">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Pulse · Inteligencia para dueños de agencia
      </footer>
    </main>
  );
}
