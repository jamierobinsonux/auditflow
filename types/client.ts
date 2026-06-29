export type ClientStatus = "Active" | "Inactive";
export type ClientHealth = "Healthy" | "On Track" | "At Risk" | "Inactive";

export type Client = {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  industry: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  phone: string | null;
  logo_url: string | null;
  brand_color: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientContact = {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  email: string | null;
  role: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientBranding = {
  id: string;
  user_id: string;
  client_id: string;
  company_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  cover_image_url: string | null;
  prepared_by: string | null;
  footer_text: string | null;
  show_watermark: boolean;
  created_at: string;
  updated_at: string;
};
