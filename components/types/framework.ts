export type StudioFrameworkStatus = "Active" | "Archived";

export type StudioFramework = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  description: string | null;
  audit_type: string | null;
  status: StudioFrameworkStatus;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type StudioFrameworkCategory = {
  id: string;
  user_id: string;
  framework_id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type StudioFrameworkJourneyStage = {
  id: string;
  user_id: string;
  framework_id: string;
  name: string;
  description: string | null;
  steps: string[];
  sort_order: number;
  created_at: string;
};

export type StudioFrameworkRecommendation = {
  id: string;
  user_id: string;
  framework_id: string;
  title: string;
  category: string | null;
  recommendation: string;
  impact: string | null;
  sort_order: number;
  created_at: string;
};

export type StudioFrameworkReportDefault = {
  id: string;
  user_id: string;
  framework_id: string;
  template: string;
  sections: string[];
  created_at: string;
  updated_at: string;
};

export type StudioFrameworkWithItems = StudioFramework & {
  categories: StudioFrameworkCategory[];
  journey_stages: StudioFrameworkJourneyStage[];
  recommendations: StudioFrameworkRecommendation[];
  report_defaults?: StudioFrameworkReportDefault | null;
};

export type StudioFrameworkDetail = StudioFrameworkWithItems;