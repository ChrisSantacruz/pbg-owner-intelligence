import { loadActivity, loadNotes } from "./data";
import type { ActivityRow, AgencySnapshot, AgentStats, MetricDef } from "./types";

/** Human disposition that confirms a real conversation happened. */
const CONFIRMING_DISPOSITIONS = new Set(["conversation", "appointment"]);

/**
 * Dataset rule: a real conversation is confirmed by an appropriate human
 * disposition OR by at least 4 speaker turns. Carrier "answered" alone is not proof.
 */
export function isConfirmedConversation(row: ActivityRow): boolean {
  return CONFIRMING_DISPOSITIONS.has(row.disposition) || row.speakerTurns >= 4;
}

/** Callbacks are not appointments (data_notes.warning). */
export function isTrueAppointment(row: ActivityRow): boolean {
  return row.appointmentType === "appointment";
}

export function isInflatedContact(row: ActivityRow): boolean {
  return row.carrierAnswered > 0 && !isConfirmedConversation(row);
}

const METRIC_DEFS: MetricDef[] = [
  {
    id: "confirmed",
    label: "Conversaciones confirmadas",
    trust: "high",
    definition:
      "Disposición humana conversation/appointment, o ≥4 turnos de speakers.",
  },
  {
    id: "appointments",
    label: "Citas reales",
    trust: "high",
    definition: "appointment_type = appointment. Los callbacks no cuentan.",
    caveat: "Un disposition=appointment sin tipo appointment se trata con cautela.",
  },
  {
    id: "carrier",
    label: "Contestadas (carrier)",
    trust: "low",
    definition: "Señal del carrier. No prueba conversación.",
    caveat: "Úsala solo como contacto técnico, nunca como productividad.",
  },
  {
    id: "inflated",
    label: "Contacto inflado",
    trust: "medium",
    definition: "Carrier answered sin conversación confirmada.",
  },
  {
    id: "premium",
    label: "Premium en pantalla",
    trust: "medium",
    definition: "Premium reportado en pantalla del agente.",
    caveat: "Puede divergir del documento (ej. Maria: screen 89 vs document 65).",
  },
  {
    id: "sales",
    label: "Ventas / Applications",
    trust: "high",
    definition: "Resultados de negocio reportados en el dataset sintético.",
  },
];

function emptyStats(agent: string, isPerson: boolean): AgentStats {
  return {
    agent,
    dials: 0,
    carrierAnswered: 0,
    confirmedConversations: 0,
    inflatedContacts: 0,
    trueAppointments: 0,
    callbackFlags: 0,
    applications: 0,
    sales: 0,
    adSpend: 0,
    premiumScreen: 0,
    trustFlags: [],
    isPerson,
    confirmationRate: 0,
    costPerSale: null,
    costPerConfirmed: null,
  };
}

export function buildAgencySnapshot(): AgencySnapshot {
  const rows = loadActivity();
  const notes = loadNotes();
  const nonPerson = new Set(
    Object.entries(notes.known_entities)
      .filter(([, v]) => v === "non_person_account")
      .map(([k]) => k),
  );
  const shared = new Set(notes.shared_phone_pair);
  const premiumOverrides = new Map(
    notes.carrier_document_premium_overrides.map((o) => [o.agent, o]),
  );

  const byAgent = new Map<string, AgentStats>();
  const totals = {
    dials: 0,
    carrierAnswered: 0,
    confirmedConversations: 0,
    inflatedContacts: 0,
    trueAppointments: 0,
    applications: 0,
    sales: 0,
    adSpend: 0,
    premiumScreen: 0,
  };

  for (const row of rows) {
    const isPerson = !nonPerson.has(row.agent);
    if (!byAgent.has(row.agent)) {
      byAgent.set(row.agent, emptyStats(row.agent, isPerson));
    }
    const s = byAgent.get(row.agent)!;
    const confirmed = isConfirmedConversation(row);
    const inflated = isInflatedContact(row);
    const appt = isTrueAppointment(row);

    s.dials += row.dials;
    s.carrierAnswered += row.carrierAnswered;
    s.applications += row.applications;
    s.sales += row.sales;
    s.adSpend += row.adSpend;
    s.premiumScreen += row.premiumScreen;
    if (confirmed) s.confirmedConversations += 1;
    if (inflated) s.inflatedContacts += 1;
    if (appt) s.trueAppointments += 1;
    if (row.appointmentType === "callback" || row.disposition === "callback") {
      s.callbackFlags += 1;
    }

    if (isPerson) {
      totals.dials += row.dials;
      totals.carrierAnswered += row.carrierAnswered;
      totals.applications += row.applications;
      totals.sales += row.sales;
      totals.adSpend += row.adSpend;
      totals.premiumScreen += row.premiumScreen;
      if (confirmed) totals.confirmedConversations += 1;
      if (inflated) totals.inflatedContacts += 1;
      if (appt) totals.trueAppointments += 1;
    }
  }

  for (const s of byAgent.values()) {
    const agentRows = rows.filter((r) => r.agent === s.agent);
    const answeredSessions = agentRows.filter((r) => r.carrierAnswered > 0).length;
    const confirmedSessions = agentRows.filter(isConfirmedConversation).length;
    s.confirmationRate =
      answeredSessions > 0 ? confirmedSessions / answeredSessions : 0;
    s.costPerSale = s.sales > 0 ? s.adSpend / s.sales : null;
    s.costPerConfirmed =
      s.confirmedConversations > 0
        ? s.adSpend / s.confirmedConversations
        : null;

    if (!s.isPerson) {
      s.trustFlags.push("Cuenta no humana — excluida del ranking de negocio.");
    }
    if (shared.has(s.agent)) {
      s.trustFlags.push(
        `Teléfono compartido con ${notes.shared_phone_pair.filter((n) => n !== s.agent).join(", ")} — atribución de dials poco confiable.`,
      );
    }
    const ov = premiumOverrides.get(s.agent);
    if (ov) {
      s.trustFlags.push(
        `Premium pantalla (${ov.screen_premium}) ≠ documento (${ov.document_premium}).`,
      );
    }
  }

  const people = [...byAgent.values()]
    .filter((a) => a.isPerson)
    .sort((a, b) => b.sales - a.sales || b.confirmedConversations - a.confirmedConversations);

  const bestCloser = [...people].sort((a, b) => b.sales - a.sales)[0];
  const mostInflated = [...people].sort(
    (a, b) => b.inflatedContacts - a.inflatedContacts,
  )[0];
  const bestConversations = [...people].sort(
    (a, b) => b.confirmedConversations - a.confirmedConversations,
  )[0];

  const inflateRatio =
    totals.carrierAnswered > 0
      ? totals.inflatedContacts /
        Math.max(
          1,
          rows.filter((r) => r.carrierAnswered > 0 && !nonPerson.has(r.agent))
            .length,
        )
      : 0;

  const insights: string[] = [
    `Si miras solo "contestadas", sobrestimas el trabajo real: ${totals.inflatedContacts} sesiones tienen carrier answered sin conversación confirmada.`,
    `${bestConversations.agent} lidera conversaciones confirmadas (${bestConversations.confirmedConversations}); ${bestCloser.agent} lidera ventas (${bestCloser.sales}). No siempre es la misma historia.`,
    `${mostInflated.agent} concentra más contacto inflado (${mostInflated.inflatedContacts}). Revisa coaching antes de premiar volumen de dials.`,
    notes.warning + " — las citas reales en este panel solo cuentan appointment_type=appointment.",
  ];

  if (inflateRatio > 0.35) {
    insights.unshift(
      "Señal de alerta: una parte material del contacto reportado no supera la regla de conversación confirmada.",
    );
  }

  const timestamps = rows.map((r) => new Date(r.timestampUtc).getTime());
  const min = new Date(Math.min(...timestamps));
  const max = new Date(Math.max(...timestamps));
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-CO", {
      timeZone: notes.timezone,
      month: "short",
      day: "numeric",
    });

  const dataWarnings = [
    "PBG Billing es cuenta no humana y se excluye de totales de negocio.",
    `Carlos y Diego comparten teléfono: no uses dials crudos para compararlos 1:1.`,
    "Premium en pantalla puede no coincidir con documentos (override documentado para Maria).",
    notes.warning,
  ];

  return {
    rangeLabel: `${fmt(min)} – ${fmt(max)} (${notes.timezone})`,
    timezone: notes.timezone,
    totals,
    agents: people,
    insights,
    metricDefs: METRIC_DEFS,
    dataWarnings,
  };
}
