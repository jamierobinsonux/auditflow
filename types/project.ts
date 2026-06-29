export type Project = {
  id: string;
  user_id: string;
  client_id: string | null;
  framework_id?: string | null;
  client_name: string | null;
  name: string;
  website_url: string | null;
  audit_type: string | null;
  status: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string | null;
};
