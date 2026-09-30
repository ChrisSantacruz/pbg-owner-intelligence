export type ActivityRow = {
  timestampUtc: string;
  agent: string;
  dials: number;
  carrierAnswered: number;
  speakerTurns: number;
  disposition: string;
  appointmentType: string;
  premiumScreen: number;
  applications: number;
  sales: number;
  adSpend: number;
};

export type DataNotes = {
  timezone: string;
  known_entities: Record<string, string>;
  shared_phone_pair: string[];
  carrier_document_premium_overrides: Array<{
    agent: string;
    document_premium: number;
    screen_premium: number;
  }>;
  warning: string;
};

export type MetricDef = {
  id: string;
  label: string;
  trust: "high" | "medium" | "low";
  definition: string;
  caveat?: string;
};

export type AgentStats = {
  agent: string;
  dials: number;
  carrierAnswered: number;
  confirmedConversations: number;
  inflatedContacts: number;
  trueAppointments: number;
  callbackFlags: number;
  applications: number;
  sales: number;
  adSpend: number;
  premiumScreen: number;
  trustFlags: string[];
  isPerson: boolean;
  confirmationRate: number;
  costPerSale: number | null;
  costPerConfirmed: number | null;
};

export type AgencySnapshot = {
  rangeLabel: string;
  timezone: string;
  totals: {
    dials: number;
    carrierAnswered: number;
    confirmedConversations: number;
    inflatedContacts: number;
    trueAppointments: number;
    applications: number;
    sales: number;
    adSpend: number;
    premiumScreen: number;
  };
  agents: AgentStats[];
  insights: string[];
  metricDefs: MetricDef[];
  dataWarnings: string[];
};
