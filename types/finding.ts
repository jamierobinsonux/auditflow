export type FindingSeverity = "P0" | "P1" | "P2" | "P3";
export type FindingStatus = "Open" | "In Progress" | "In Review" | "Resolved";

export type Finding = {
  id: string;
  project_id: string;
  journey_id: string | null;
  title: string;
  description: string | null;
  severity: FindingSeverity;
  status: FindingStatus;
  recommendation: string | null;
  evidence_url: string | null;
  created_at: string;
};