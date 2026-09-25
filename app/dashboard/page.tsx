"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCompass,
  FiAward,
  FiCalendar,
  FiCheckSquare,
  FiBookmark,
  FiDollarSign,
  FiArrowRight,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { DiscoveryItem, SavedOpportunity, PlanSummary } from "@/types";
import { ProfileCompletenessCard } from "@/components/dashboard/ProfileCompletenessCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { EligibilityBadge } from "@/components/ui/EligibilityBadge";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<DiscoveryItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedOpportunity[]>([]);
  const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch recommendations from discovery API
        const disc = await api.discover({
          query: profile?.field_of_study
            ? `Master's in ${profile.field_of_study} in ${profile.preferred_countries?.join(" ") || "Germany"}`
            : "Master's programs with scholarship",
          include_web_retrieval: true,
        });
        setRecommendations(disc.results || []);

        // Fetch saved opportunities
        const saved = await api.getSavedOpportunities();
        setSavedItems(saved || []);

        // Fetch plan summary
        const plan = await api.getPlanSummary();
        setPlanSummary(plan);
      } catch (err) {
        console.warn("Using offline dashboard fallback data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [profile]);

  const handleRemoveSaved = async (id: number) => {
    try {
      await api.removeSavedOpportunity(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.full_name || "Student"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Targeting: {profile?.desired_degree || "Master's"} in {profile?.field_of_study || "Computer Science"} •{" "}
            Intake: {profile?.preferred_intake || "Fall 2026"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/onboarding"
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Edit Profile
          </Link>
          <Link
            href="/discover"
            className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-xs font-semibold text-white transition shadow-xs flex items-center"
          >
            <FiCompass className="w-3.5 h-3.5 mr-1.5" />
            Discover More
          </Link>
        </div>
      </div>

      {/* Top Grid: Profile Completeness & Application Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Completeness Card */}
        <div className="lg:col-span-1">
          <ProfileCompletenessCard profile={profile} />
        </div>

        {/* Application Progress Roadmap Tracker */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Application Progress Roadmap</h3>
            <Link href="/plan" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View Detailed Tasks ({planSummary?.completed_tasks || 0}/{planSummary?.total_tasks || 11}) →
            </Link>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${planSummary?.progress_percentage || 25}%` }}
            />
          </div>

          {/* Milestone Steps Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[11px]">
            {[
              { label: "Profile", done: true },
              { label: "Shortlist", done: (savedItems.length > 0) },
              { label: "Documents", done: false },
              { label: "Apply", done: false },
              { label: "Scholarship", done: false },
              { label: "Visa", done: false },
            ].map((step, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border font-medium ${
                  step.done
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
                    : "bg-slate-50 text-slate-500 border-slate-100"
                }`}
              >
                {step.done ? (
                  <FiCheckCircle className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-600" />
                ) : (
                  <FiClock className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" />
                )}
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area: Recommended Opportunities & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <FiAward className="w-4 h-4 mr-2 text-teal-600" />
              Recommended for Your Academic Profile
            </h2>
            <Link href="/discover" className="text-xs text-teal-700 font-semibold hover:underline">
              View all results
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">No active recommendations found.</p>
            </div>
          ) : (
            recommendations.slice(0, 4).map((item) => (
              <div
                key={item.id + item.type}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={item.status} deadline={item.deadline} />
                    <SourceBadge
                      tier={item.source_tier}
                      sourceUrl={item.source_url}
                      sourceTitle={item.organization}
                    />
                  </div>
                  <span className="text-xs text-slate-400">Verified {item.country}</span>
                </div>

                <Link
                  href={item.type === "scholarship" ? `/scholarships/${item.id}` : `/universities/${item.id}`}
                  className="font-bold text-slate-900 hover:text-teal-700 transition block text-sm"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500 mt-0.5">{item.organization}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Deadline: </span>
                    <span className="font-semibold text-slate-700">{item.deadline}</span>
                  </div>
                  <EligibilityBadge eligibility={item.eligibility} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Col: Saved Opportunities & Deadlines */}
        <div className="space-y-6">
          {/* Saved Opportunities */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center">
                <FiBookmark className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Saved Opportunities ({savedItems.length})
              </h3>
              <Link href="/plan" className="text-xs text-teal-700 font-semibold">
                Manage
              </Link>
            </div>

            {savedItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                You haven&apos;t saved any opportunities yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {savedItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.country} • Due {item.deadline || "TBA"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSaved(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Deadlines Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center pb-3 border-b border-slate-100 mb-3">
              <FiCalendar className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Upcoming Academic Deadlines
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">TUM Munich Application Portal</p>
                  <p className="text-slate-500 text-[11px]">May 31, 2026 • Winter Intake</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">DAAD Helmut-Schmidt Window</p>
                  <p className="text-slate-500 text-[11px]">Opens June 1, 2026 • Public Policy</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">ETH Zurich ESOP Scholarship</p>
                  <p className="text-slate-500 text-[11px]">Opens Nov 1, 2026 • Full Grant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
