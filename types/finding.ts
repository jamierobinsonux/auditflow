export type Finding = {
  id: string;
  user_id: string;
  project_id: string;
  title: string | null;
  description?: string | null;
  severity: string | null;
  impact: string | null;
  effort: string | null;
  status: string | null;
  recommendation?: string | null;
  category?: string | null;
  created_at: string;
  updated_at?: string | null;
};
