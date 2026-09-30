import type { AgencySnapshot } from "./types";

/** Compact context for LLM prompts — scalable without dumping raw CSV. */
export function snapshotToContext(snap: AgencySnapshot, sourceLabel = "agencia") {
  return {
    source: sourceLabel,
    period: snap.rangeLabel,
    timezone: snap.timezone,
    totals: snap.totals,
    agents: snap.agents.map((a) => ({
      agent: a.agent,
      dials: a.dials,
      answeredSignal: a.carrierAnswered,
      realConversations: a.confirmedConversations,
      unprovenContact: a.inflatedContacts,
      realAppointments: a.trueAppointments,
      callbacks: a.callbackFlags,
      applications: a.applications,
      sales: a.sales,
      adSpend: Math.round(a.adSpend),
      qualityRate: Number((a.confirmationRate * 100).toFixed(1)),
      costPerSale: a.costPerSale != null ? Math.round(a.costPerSale) : null,
      attention: a.trustFlags,
    })),
    readings: snap.insights,
    watchouts: snap.dataWarnings,
    metricRules: snap.metricDefs.map((m) => ({
      name: m.label,
      trust: m.trust,
      definition: m.definition,
    })),
  };
}
