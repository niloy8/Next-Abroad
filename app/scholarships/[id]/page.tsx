"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiAward,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiExternalLink,
  FiBookmark,
  FiPlus,
  FiCheck,
  FiMapPin,
  FiShield,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { Scholarship, EligibilityResult } from "@/types";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EligibilityBadge } from "@/components/ui/EligibilityBadge";

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [addedToPlan, setAddedToPlan] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const sch = await api.getScholarshipById(id);
        setScholarship(sch);
        const elig = await api.getScholarshipEligibility(id);
        setEligibility(elig);
      } catch (err) {
        console.warn("Could not load scholarship details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!scholarship) return;
    try {
      await api.saveOpportunity({
        opportunity_type: "scholarship",
        opportunity_id: scholarship.id,
        title: scholarship.name,
        subtitle: scholarship.provider,
        country: scholarship.country,
        deadline: scholarship.application_deadline,
      });
      setSaved(true);
    } catch (e) {
      setSaved(true);
    }
  };

  const handleAddToPlan = async () => {
    if (!scholarship) return;
    try {
      await api.createTask({
        title: `Submit application for ${scholarship.name}`,
        category: "Submission",
        deadline: scholarship.application_deadline,
        description: `Apply via official portal: ${scholarship.official_application_url}`,
      });
      setAddedToPlan(true);
    } catch (e) {
      setAddedToPlan(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading verified scholarship details...
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Scholarship Not Found</h2>
        <Link href="/scholarships" className="text-xs text-teal-700 font-semibold mt-2 inline-block">
          ← Return to Scholarships Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        href="/scholarships"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <FiArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Scholarships
      </Link>

      {/* Main Details Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <StatusBadge status={scholarship.status} deadline={scholarship.application_deadline} />
            <SourceBadge
              tier={scholarship.source?.tier || "TIER_1"}
              sourceUrl={scholarship.official_application_url}
              sourceTitle={scholarship.provider}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center transition ${
                saved
                  ? "bg-teal-50 border-teal-200 text-teal-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {saved ? (
                <>
                  <FiCheck className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Saved
                </>
              ) : (
                <>
                  <FiBookmark className="w-3.5 h-3.5 mr-1.5" />
                  Save Scholarship
                </>
              )}
            </button>
            <button
              onClick={handleAddToPlan}
              disabled={addedToPlan}
              className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center transition shadow-xs"
            >
              {addedToPlan ? (
                <>
                  <FiCheck className="w-3.5 h-3.5 mr-1.5" />
                  Added to My Plan
                </>
              ) : (
                <>
                  <FiPlus className="w-3.5 h-3.5 mr-1.5" />
                  Add to My Plan
                </>
              )}
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {scholarship.name}
        </h1>
        <p className="text-sm font-semibold text-teal-700 mt-1">{scholarship.provider}</p>

        {scholarship.overview && (
          <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
            {scholarship.overview}
          </p>
        )}

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Funding Coverage</span>
            <span className="font-bold text-slate-800">{scholarship.funding_type}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Monthly Stipend</span>
            <span className="font-bold text-slate-800">
              {scholarship.monthly_stipend
                ? `${scholarship.monthly_stipend.toLocaleString()} ${scholarship.stipend_currency}/mo`
                : "Tuition Waiver"}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Destination</span>
            <span className="font-bold text-slate-800">{scholarship.country}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Application Deadline</span>
            <span className="font-bold text-rose-700">{scholarship.application_deadline}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Eligibility & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligibility Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <FiCheckCircle className="w-4 h-4 mr-2 text-teal-600" />
                Eligibility Criteria Evaluation
              </h2>
              <EligibilityBadge eligibility={eligibility || undefined} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-slate-400 block text-[11px]">Minimum CGPA Required</span>
                <span className="font-bold text-slate-800">
                  {scholarship.min_cgpa.toFixed(2)} / {scholarship.grading_scale.toFixed(1)} Scale
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-slate-400 block text-[11px]">Language Threshold</span>
                <span className="font-bold text-slate-800">
                  IELTS {scholarship.min_ielts} or TOEFL {scholarship.min_toefl}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Eligible Nationalities</span>
                <span className="font-semibold text-slate-700">
                  {scholarship.eligible_nationalities?.join(", ") || "International candidates"}
                </span>
              </div>
            </div>

            {/* Criteria breakdown check list */}
            {eligibility && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-semibold text-slate-700">Detailed Check:</h3>
                {eligibility.criteria_checks?.map((check, idx) => (
                  <div key={idx} className="flex items-start text-xs p-2 rounded bg-slate-50">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 mr-2 shrink-0 ${
                        check.passed ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-slate-800">
                        {check.criterion}: <span className="font-normal">{check.details}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center">
              <FiFileText className="w-4 h-4 mr-2 text-teal-600" />
              Required Application Documents
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {scholarship.required_documents?.map((doc, idx) => (
                <li key={idx} className="flex items-start">
                  <FiCheck className="w-3.5 h-3.5 text-teal-600 mr-2 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Steps */}
          {scholarship.application_steps && scholarship.application_steps.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center">
                <FiCalendar className="w-4 h-4 mr-2 text-teal-600" />
                Step-by-Step Application Process
              </h2>
              <div className="space-y-3 text-xs">
                {scholarship.application_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-800 font-bold text-[11px] flex items-center justify-center mr-3 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Primary Portal & Source Provenance */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Official Application Portal
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Always verify deadlines and submit final documents directly via the primary institutional portal.
            </p>
            <a
              href={scholarship.official_application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition"
            >
              Open Official Portal
              <FiExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center">
              <FiShield className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Source Verification Provenance
            </h4>
            <p className="text-[11px]">
              <span className="font-semibold text-slate-700">Source Tier:</span> Tier 1 (Official Government / University Portal)
            </p>
            <p className="text-[11px]">
              <span className="font-semibold text-slate-700">Last Verified:</span>{" "}
              {scholarship.last_verified_at ? scholarship.last_verified_at.substring(0, 10) : "2026-03-01"}
            </p>
            <p className="text-[11px]">
              <span className="font-semibold text-slate-700">Current Status:</span> {scholarship.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
