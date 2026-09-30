import { readFileSync } from "fs";
import path from "path";
import type { ActivityRow, DataNotes } from "./types";

const REQUIRED_COLUMNS = [
  "timestamp_utc",
  "agent",
  "dials",
  "carrier_answered",
  "speaker_turns",
  "disposition",
  "appointment_type",
  "premium_screen",
  "applications",
  "sales",
  "ad_spend",
] as const;

export function parseActivityCsv(text: string): ActivityRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("El archivo CSV está vacío o incompleto.");
  }

  const header = lines[0].split(",").map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    throw new Error(
      `Faltan columnas: ${missing.join(", ")}. Usa el formato de actividad de Pulse.`,
    );
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  return lines.slice(1).filter(Boolean).map((line, rowIndex) => {
    const c = line.split(",");
    const agent = (c[idx.agent] ?? "").trim();
    if (!agent) {
      throw new Error(`Fila ${rowIndex + 2}: falta el nombre del agente.`);
    }
    return {
      timestampUtc: c[idx.timestamp_utc],
      agent,
      dials: Number(c[idx.dials]) || 0,
      carrierAnswered: Number(c[idx.carrier_answered]) || 0,
      speakerTurns: Number(c[idx.speaker_turns]) || 0,
      disposition: (c[idx.disposition] ?? "").trim(),
      appointmentType: (c[idx.appointment_type] ?? "").trim(),
      premiumScreen: Number(c[idx.premium_screen]) || 0,
      applications: Number(c[idx.applications]) || 0,
      sales: Number(c[idx.sales]) || 0,
      adSpend: Number(c[idx.ad_spend]) || 0,
    };
  });
}

export function parseNotesJson(text: string): DataNotes {
  const parsed = JSON.parse(text) as Partial<DataNotes>;
  return {
    timezone: parsed.timezone || "America/New_York",
    known_entities: parsed.known_entities || {},
    shared_phone_pair: parsed.shared_phone_pair || [],
    carrier_document_premium_overrides:
      parsed.carrier_document_premium_overrides || [],
    warning: parsed.warning || "Callbacks are not appointments.",
  };
}

export function loadActivity(): ActivityRow[] {
  const file = path.join(process.cwd(), "src", "data", "activity.csv");
  return parseActivityCsv(readFileSync(file, "utf8"));
}

export function loadNotes(): DataNotes {
  const file = path.join(process.cwd(), "src", "data", "data_notes.json");
  return parseNotesJson(readFileSync(file, "utf8"));
}
