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
  return data.choices?.[0]?.message?.content?.trim() || null;
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
        content: `Eres Pulse, el asesor inteligente del dueño de una agencia de seguros.
Respondes en español, claro y accionable. Sin jerga de ingeniería.
Reglas de confianza (innegociables):
- Conversación real = disposición conversation/appointment O ≥4 turnos de speakers.
- Una llamada contestada NO prueba conversación.
- Callbacks NO son citas.
- Si un dato no es confiable, dilo y explica por qué.
Usa solo el contexto de negocio provisto. Si falta información, dilo y propone qué cargar después.
Respuestas: 80-140 palabras, con 1 acción concreta al final.`,
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
