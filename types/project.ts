export type ProjectStatus = "In Progress" | "In Review" | "Completed";

export type Project = {
  id: string;
  name: string;
  client_name: string | null;
  website_url: string | null;
  audit_type: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string | null;
};