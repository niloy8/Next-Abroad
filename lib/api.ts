import {
  Scholarship,
  University,
  Country,
  StudentProfile,
  DiscoveryItem,
  SavedOpportunity,
  ApplicationTask,
  PlanSummary,
  CostBreakdown,
  EligibilityResult,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nextabroad_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // If backend is offline during client dev, return null or throw with clean message
    console.warn(`API request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; full_name: string }) =>
    request<{ access_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => request<any>("/auth/me"),

  // Profiles
  getMyProfile: () => request<StudentProfile>("/profiles/me"),
  updateProfile: (profile: Partial<StudentProfile>) =>
    request<StudentProfile>("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
  getCompleteness: () => request<{ completeness_score: number; missing_fields: string[]; completed_fields: string[] }>("/profiles/me/completeness"),

  // Scholarships
  getScholarships: (params?: Record<string, string | undefined>) => {
    const clean: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) clean[k] = v;
      });
    }
    const query = new URLSearchParams(clean).toString();
    return request<Scholarship[]>(`/scholarships${query ? `?${query}` : ""}`);
  },
  getScholarshipById: (id: number) => request<Scholarship>(`/scholarships/${id}`),
  getScholarshipEligibility: (id: number) => request<EligibilityResult>(`/scholarships/${id}/eligibility`),

  // Universities
  getUniversities: (params?: Record<string, string | undefined>) => {
    const clean: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) clean[k] = v;
      });
    }
    const query = new URLSearchParams(clean).toString();
    return request<University[]>(`/universities${query ? `?${query}` : ""}`);
  },
  getUniversityById: (id: number) => request<University>(`/universities/${id}`),
  getUniversityMatch: (id: number, programId?: number) =>
    request<any>(`/universities/${id}/match${programId ? `?program_id=${programId}` : ""}`),

  // Discovery Engine
  discover: (payload: { query?: string; filters?: any; include_web_retrieval?: boolean }) =>
    request<{
      total_found: number;
      parsed_parameters: any;
      results: DiscoveryItem[];
      retrieved_from_web: boolean;
      sources_consulted: any[];
    }>("/search/discover", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Costs
  getCostEstimate: (params: {
    country: string;
    city?: string;
    tuition?: number;
    living?: number;
    base_currency?: string;
    target_currency?: string;
    scholarship_offset?: number;
  }) => {
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) cleanParams[k] = String(v);
    });
    const query = new URLSearchParams(cleanParams).toString();
    return request<CostBreakdown>(`/costs/estimate?${query}`);
  },

  // Plan & Roadmap
  getPlanSummary: () => request<PlanSummary>("/plan/summary"),
  saveOpportunity: (payload: {
    opportunity_type: string;
    opportunity_id: number;
    title: string;
    subtitle?: string;
    country?: string;
    deadline?: string;
  }) =>
    request<SavedOpportunity>("/plan/saved", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getSavedOpportunities: () => request<SavedOpportunity[]>("/plan/saved"),
  removeSavedOpportunity: (id: number) =>
    request<any>(`/plan/saved/${id}`, { method: "DELETE" }),
  createTask: (task: { title: string; category?: string; deadline?: string; description?: string }) =>
    request<ApplicationTask>("/plan/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  updateTask: (id: number, updates: Partial<ApplicationTask>) =>
    request<ApplicationTask>(`/plan/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  deleteTask: (id: number) => request<any>(`/plan/tasks/${id}`, { method: "DELETE" }),

  // Countries
  getCountries: () => request<Country[]>("/countries"),
  getCountryByCode: (code: string) => request<Country>(`/countries/${code}`),

  // Ask StudyPath AI Assistant
  askAssistant: (payload: { message: string; conversation_id?: number; context_type?: string; context_id?: number }) =>
    request<{
      conversation_id: number;
      reply: string;
      citations: any[];
      verified_data: boolean;
      suggested_follow_ups: string[];
    }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Admin & Ingestion
  previewIngestion: (payload: { source_url: string; source_type: string }) =>
    request<any>("/admin/ingest/preview", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  approveIngestion: (payload: any) =>
    request<any>("/admin/ingest/approve", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getFreshnessAudit: () => request<any>("/admin/freshness/audit"),
  recheckSource: (id: number) => request<any>(`/admin/freshness/verify/${id}`, { method: "POST" }),
};
