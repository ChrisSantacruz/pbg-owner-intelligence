import { snapshotToContext } from "./snapshotContext";
import type { AgencySnapshot } from "./types";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function modelName() {
  return process.env.GROQ_MODEL || "openai/gpt-oss-20b";
}

function apiKey() {
  return process.env.GROQ_API_KEY;
}

async function groqChat(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number },
): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName(),
      temperature: opts?.temperature ?? 0.35,
      max_tokens: opts?.maxTokens ?? 500,
      messages,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content?.trim() || null;
  return raw ? polishAssistantText(raw) : null;
}

/** Keep chat client-facing if the model slips into markdown tables. */
function polishAssistantText(text: string) {
  const lines = text.split(/\r?\n/);
  const cleaned = lines
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      if (/^\|/.test(t)) return false;
      if (/^:?-{3,}/.test(t.replace(/\|/g, ""))) return false;
      return true;
    })
    .join("\n")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned || text.trim();
}

export async function generateOwnerBrief(snap: AgencySnapshot): Promise<string | null> {
  const context = snapshotToContext(snap);
  return groqChat(
    [
      {
        role: "system",
        content:
          "Eres el asesor del dueño de una agencia de seguros. Español claro, tono ejecutivo, sin jerga técnica. Prioriza conversaciones reales, citas reales y ventas. Nunca trates una llamada contestada como conversación. Máximo 90 palabras. Tres viñetas: 1) qué está pasando, 2) qué dato no debes creer, 3) qué hacer esta semana.",
      },
      {
        role: "user",
        content: `Resume esto para el dueño de la agencia:\n${JSON.stringify(context)}`,
      },
    ],
    { temperature: 0.3, maxTokens: 280 },
  );
}

export async function answerOwnerQuestion(params: {
  snap: AgencySnapshot;
  question: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  sourceLabel?: string;
}): Promise<string | null> {
  const context = snapshotToContext(params.snap, params.sourceLabel);
  const history = (params.history || []).slice(-8);

  return groqChat(
    [
      {
        role: "system",
        content: `Eres Pulse, el asesor del dueño de una agencia de seguros.
Habla como un consultor senior: cálido, directo, premium. Español natural.

Formato OBLIGATORIO (para chat móvil):
- NUNCA uses tablas Markdown, pipes |, ni bloques tipo spreadsheet.
- NUNCA uses encabezados ## ni negritas excesivas.
- Usa párrafos cortos y viñetas simples con "•".
- Máximo 4 agentes por respuesta; prioriza los más urgentes.
- Por agente: 1 línea con nombre + motivo claro en lenguaje de negocio.
- Cierra SIEMPRE con "Próximo paso:" y una acción concreta de esta semana.

Reglas de confianza:
- Conversación real = registro conversation/appointment O ≥4 turnos.
- Contestada ≠ conversación.
- Callback ≠ cita.
- Si un dato no es confiable, dilo en palabras simples.

Usa solo el contexto provisto. 90-130 palabras. Sin jerga técnica.`,
      },
      {
        role: "user",
        content: `Contexto actual del negocio:\n${JSON.stringify(context)}`,
      },
      ...history,
      { role: "user", content: params.question },
    ],
    { temperature: 0.4, maxTokens: 450 },
  );
}
