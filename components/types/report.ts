export type ReportExport = {
  id: string;
  user_id: string;
  project_id: string;
  client_id: string | null;
  title: string | null;
  template: string | null;
  sections: string[] | null;
  options?: Record<string, unknown> | null;
  version: number | null;
  file_name: string | null;
  created_at: string;
  project?: {
    id: string;
    name: string;
    client_id: string | null;
    client?: {
      id: string;
      name: string;
    } | null;
  } | null;
};
