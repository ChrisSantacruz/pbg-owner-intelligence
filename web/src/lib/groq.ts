import type { AgencySnapshot } from "./types";

export async function generateOwnerBrief(snap: AgencySnapshot): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  const payload = {
    range: snap.rangeLabel,
    totals: snap.totals,
    topAgents: snap.agents.slice(0, 5).map((a) => ({
      agent: a.agent,
      confirmed: a.confirmedConversations,
      inflated: a.inflatedContacts,
      sales: a.sales,
      trueAppointments: a.trueAppointments,
      flags: a.trustFlags,
    })),
    warnings: snap.dataWarnings,
    heuristicInsights: snap.insights,
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 280,
      messages: [
        {
          role: "system",
          content:
            "Eres el analista ejecutivo de una agencia de seguros. Escribes en español, claro y directo. Priorizas métricas de alta confianza (conversaciones confirmadas, citas reales, ventas). Nunca trates carrier answered como prueba de conversación. Máximo 90 palabras. Devuelve 3 viñetas cortas: 1) diagnóstico, 2) riesgo de datos, 3) acción de esta semana.",
        },
        {
          role: "user",
          content: `Resume esto para el dueño de la agencia:\n${JSON.stringify(payload)}`,
        },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}
