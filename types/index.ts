export type SourceTier = "TIER_1" | "TIER_2" | "TIER_3";

export type OpportunityStatus = "OPEN" | "UPCOMING" | "EXPIRED" | "ROLLING" | "UNKNOWN";

export type EligibilityStatus = "Eligible" | "Potentially Eligible" | "Not Eligible";

export type FundingType = "Fully Funded" | "Partial Scholarship" | "Tuition Waiver" | "Monthly Stipend Only";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Source {
  id: number;
  url: string;
  title: string;
  tier: SourceTier;
  organization?: string;
  is_verified: boolean;
  retrieved_at: string;
  last_verified_at: string;
}

export interface EligibilityCriteriaCheck {
  criterion: string;
  passed: boolean;
  status: "Passed" | "Failed" | "Needs Verification";
  required: string;
  actual: string;
  details: string;
}

export interface EligibilityResult {
  opportunity_id: number;
  opportunity_name: string;
  opportunity_type: "scholarship" | "program";
  overall_status: EligibilityStatus;
  summary_reason: string;
  criteria_checks: EligibilityCriteriaCheck[];
  actionable_advice?: string;
}

export interface Scholarship {
  id: number;
  name: string;
  provider: string;
  country: string;
  university_id?: number;
  degree_level: string;
  eligible_fields: string[];
  funding_type: FundingType;
  tuition_coverage_pct: number;
  monthly_stipend: number;
  stipend_currency: string;
  travel_support: boolean;
  travel_allowance_amount: number;
  accommodation_support: boolean;
  health_insurance: boolean;
  min_cgpa: number;
  grading_scale: number;
  min_ielts: number;
  min_toefl: number;
  eligible_nationalities: string[];
  work_experience_years_required: number;
  required_documents: string[];
  application_steps: string[];
  application_open_date?: string;
  application_deadline: string;
  status: OpportunityStatus;
  status_reason?: string;
  official_application_url: string;
  source_id?: number;
  source?: Source;
  last_verified_at: string;
  overview?: string;
}

export interface Program {
  id: number;
  university_id: number;
  name: string;
  degree_level: string;
  field_of_study: string;
  duration_months: number;
  tuition_annual: number;
  currency: string;
  language: string;
  min_cgpa: number;
  grading_scale: number;
  min_ielts: number;
  min_toefl: number;
  gre_required: boolean;
  intake: string;
  application_deadline: string;
  status: OpportunityStatus;
  application_url?: string;
  overview?: string;
}

export interface University {
  id: number;
  name: string;
  country: string;
  city: string;
  global_rank?: number;
  type: string;
  website_url: string;
  admissions_url?: string;
  living_cost_annual: number;
  currency: string;
  acceptance_rate?: number;
  overview?: string;
  source_id?: number;
  source?: Source;
  programs?: Program[];
  last_verified_at: string;
}

export interface Country {
  id: number;
  code: string;
  name: string;
  currency: string;
  avg_tuition_min: number;
  avg_tuition_max: number;
  avg_living_annual_min: number;
  avg_living_annual_max: number;
  visa_work_rights: string;
  post_study_work_visa: string;
  blocked_account_required: number;
  popular_fields: string[];
  flag_code?: string;
  description?: string;
}

export interface StudentProfile {
  id?: number;
  user_id?: number;
  nationality?: string;
  country_of_residence?: string;
  current_degree?: string;
  desired_degree?: string;
  field_of_study?: string;
  institution?: string;
  cgpa?: number;
  grading_scale?: number;
  graduation_year?: number;
  english_test?: string;
  english_score?: number;
  english_subscores?: Record<string, number>;
  max_annual_tuition?: number;
  max_annual_living?: number;
  currency?: string;
  preferred_countries?: string[];
  preferred_cities?: string[];
  scholarship_required?: boolean;
  fully_funded_preference?: boolean;
  partial_scholarship_acceptable?: boolean;
  tuition_waiver_preference?: boolean;
  part_time_work_preference?: boolean;
  research_preference?: boolean;
  public_private_preference?: string;
  preferred_intake?: string;
  completeness_score?: number;
  cv_extracted_data?: any;
}

export interface DiscoveryItem {
  id: number;
  type: "scholarship" | "program";
  title: string;
  organization: string;
  country: string;
  degree_level: string;
  field_of_study: string;
  funding_type?: string;
  status: OpportunityStatus;
  deadline: string;
  tuition_annual: number;
  living_cost_annual: number;
  total_estimated_first_year: number;
  currency: string;
  source_url: string;
  source_title: string;
  source_tier: SourceTier;
  last_verified_at: string;
  eligibility?: EligibilityResult;
  match_category?: string;
  match_explanation?: string;
}

export interface SavedOpportunity {
  id: number;
  user_id: number;
  opportunity_type: string;
  opportunity_id: number;
  title: string;
  subtitle?: string;
  country?: string;
  deadline?: string;
  notes?: string;
  saved_at: string;
}

export interface ApplicationTask {
  id: number;
  user_id: number;
  opportunity_id?: number;
  title: string;
  category: string;
  description?: string;
  deadline?: string;
  status: TaskStatus;
  order_index: number;
  is_custom: boolean;
  completed_at?: string;
  created_at: string;
}

export interface PlanSummary {
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  saved_opportunities_count: number;
  upcoming_deadlines: ApplicationTask[];
  tasks: ApplicationTask[];
}

export interface CostBreakdown {
  country: string;
  city?: string;
  university_name?: string;
  program_name?: string;
  base_currency: string;
  target_currency: string;
  exchange_rate: number;
  tuition_annual: number;
  living_annual: number;
  health_insurance_annual: number;
  visa_residence_permit: number;
  application_fees: number;
  other_documented_costs: number;
  estimated_first_year_total: number;
  estimated_recurring_annual_total: number;
  scholarship_offset_annual: number;
  net_first_year_out_of_pocket: number;
  net_recurring_annual_out_of_pocket: number;
  source_attribution: string;
  last_verified: string;
}

export interface CitationItem {
  title: string;
  url: string;
  tier: string;
  last_verified?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationItem[];
  timestamp: string;
}
