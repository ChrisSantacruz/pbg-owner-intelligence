import { readFileSync } from "fs";
import path from "path";
import type { ActivityRow, DataNotes } from "./types";

function parseCsv(text: string): ActivityRow[] {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  return lines.slice(1).filter(Boolean).map((line) => {
    const c = line.split(",");
    return {
      timestampUtc: c[idx.timestamp_utc],
      agent: c[idx.agent],
      dials: Number(c[idx.dials]),
      carrierAnswered: Number(c[idx.carrier_answered]),
      speakerTurns: Number(c[idx.speaker_turns]),
      disposition: c[idx.disposition],
      appointmentType: c[idx.appointment_type],
      premiumScreen: Number(c[idx.premium_screen]),
      applications: Number(c[idx.applications]),
      sales: Number(c[idx.sales]),
      adSpend: Number(c[idx.ad_spend]),
    };
  });
}

export function loadActivity(): ActivityRow[] {
  const file = path.join(process.cwd(), "src", "data", "activity.csv");
  return parseCsv(readFileSync(file, "utf8"));
}

export function loadNotes(): DataNotes {
  const file = path.join(process.cwd(), "src", "data", "data_notes.json");
  return JSON.parse(readFileSync(file, "utf8")) as DataNotes;
}
