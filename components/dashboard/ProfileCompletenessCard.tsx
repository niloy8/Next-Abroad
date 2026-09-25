"use client";

import React from "react";
import Link from "next/link";
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { StudentProfile } from "@/types";

interface ProfileCompletenessCardProps {
  profile: StudentProfile | null;
}

export const ProfileCompletenessCard: React.FC<ProfileCompletenessCardProps> = ({ profile }) => {
  const score = profile?.completeness_score || 0;

  const missing = [];
  if (!profile?.cgpa) missing.push("Academic CGPA");
  if (!profile?.english_score || profile?.english_test === "Not taken yet")
    missing.push("English Test Score");
  if (!profile?.field_of_study) missing.push("Field of Study");
  if (!profile?.max_annual_tuition) missing.push("Tuition Budget");
  if (!profile?.preferred_countries || profile.preferred_countries.length === 0)
    missing.push("Target Countries");

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Profile Completeness</h3>
        <span className="text-base font-extrabold text-teal-700">{score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            score >= 80 ? "bg-teal-600" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {score >= 85 ? (
        <div className="flex items-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2">
          <FiCheckCircle className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
          <span>Profile is verified for automated deterministic eligibility evaluation!</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
            <FiAlertCircle className="w-4 h-4 mr-1.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Missing fields for 100% eligibility calculation:</p>
              <p className="text-slate-600 mt-0.5">{missing.join(", ") || "General preferences"}</p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800"
          >
            Complete missing fields <FiArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
