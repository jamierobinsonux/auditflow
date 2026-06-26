export type Finding = {
  id: string;
  project_id: string;
  user_id: string;
  journey_id?: string | null;
  journey_step_id?: string | null;

  title: string;
  description: string | null;
  severity: string | null;
  status: string | null;
  recommendation: string | null;

  impact: string | null;
  effort: string | null;

  created_at: string;
  updated_at?: string | null;
};