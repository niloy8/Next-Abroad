"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiCompass,
  FiSearch,
  FiAward,
  FiCheckCircle,
  FiDollarSign,
  FiBookOpen,
  FiShield,
  FiArrowRight,
  FiMapPin,
  FiCalendar,
  FiCheckSquare,
  FiMessageSquare,
  FiUploadCloud,
} from "react-icons/fi";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EligibilityBadge } from "@/components/ui/EligibilityBadge";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "matches" | "cost" | "roadmap">("matches");

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 bg-linear-to-b from-teal-50/50 via-slate-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-6">
            <FiShield className="w-3.5 h-3.5 text-teal-700" />
            <span>Tier-1 Verified Educational Sources • Zero Hallucinations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Find the right path to <span className="text-teal-700">study abroad.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover universities, scholarships, costs, eligibility requirements, and application steps based
            on your academic profile and goals.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 transition shadow-sm"
            >
              Build My Study Plan
              <FiArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/discover"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
            >
              <FiCompass className="w-4 h-4 mr-2 text-teal-600" />
              Explore Opportunities
            </Link>
          </div>

          {/* Quick search input teaser */}
          <div className="mt-12 max-w-2xl mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <FiSearch className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              readOnly
              value="e.g. Master's in Computer Science in Germany with full scholarship (CGPA 3.2+)"
              className="w-full px-3 py-2 text-xs sm:text-sm text-slate-500 bg-transparent cursor-pointer focus:outline-none"
              onClick={() => (window.location.href = "/discover")}
            />
            <Link
              href="/discover"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition"
            >
              Search Live
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Restrained Product Preview Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Personalized Discovery & Match Engine
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              How NextAbroad AI correlates your academic profile with verified university and scholarship requirements.
            </p>
          </div>

          {/* Preview Navigation Tabs */}
          <div className="flex items-center justify-center border-b border-slate-200 mb-8 space-x-2 sm:space-x-4">
            {[
              { id: "matches", label: "Scholarship Matches", icon: FiAward },
              { id: "profile", label: "Student Profile", icon: FiCheckSquare },
              { id: "cost", label: "Cost Breakdown", icon: FiDollarSign },
              { id: "roadmap", label: "Application Roadmap", icon: FiCalendar },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${active
                    ? "border-teal-700 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
            {activeTab === "matches" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                {/* Match Card 1 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status="UPCOMING" />
                    <SourceBadge tier="TIER_1" sourceTitle="DAAD Bonn Official" sourceUrl="https://daad.de" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    DAAD Helmut-Schmidt-Programme (Public Policy & Governance)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Provider: German Academic Exchange Service (DAAD)</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Coverage: </span>
                      <span className="text-xs font-bold text-slate-800">€934/mo + 100% Tuition</span>
                    </div>
                    <EligibilityBadge
                      status="Eligible"
                      reason="Eligible: Student CGPA (3.42) >= min (3.00), IELTS 7.0 >= min 6.5, eligible nationality verified."
                    />
                  </div>
                </div>

                {/* Match Card 2 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status="OPEN" />
                    <SourceBadge tier="TIER_1" sourceTitle="TUM Munich Admissions" sourceUrl="https://tum.de" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    M.Sc. in Informatics (Computer Science)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Technical University of Munich (QS #28)</p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500">Tuition: </span>
                      <span className="text-xs font-bold text-emerald-700">€0 / Free Public University</span>
                    </div>
                    <EligibilityBadge
                      status="Eligible"
                      reason="Eligible: Academic GPA 3.42/4.0 exceeds minimum admission threshold."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Tanvir Rahman</h3>
                    <p className="text-xs text-slate-500">Targeting Fall 2026 Master&apos;s Intake</p>
                  </div>
                  <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-bold">
                    Profile Completeness: 85%
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block">Current Degree</span>
                    <span className="font-semibold text-slate-800">B.Sc. in Computer Science</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block">Academic CGPA</span>
                    <span className="font-semibold text-slate-800">3.42 / 4.0 Scale</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block">Language Proficiency</span>
                    <span className="font-semibold text-slate-800">IELTS Band 7.0</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block">Target Destinations</span>
                    <span className="font-semibold text-slate-800">Germany, Sweden, Switzerland</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "cost" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Estimated Cost Analysis (Munich, Germany)
                  </h3>
                  <span className="text-xs text-slate-500">Primary currency: EUR converted to USD</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium">Estimated Tuition</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">$0 / year</p>
                    <span className="text-[11px] text-emerald-700 mt-1 block">Public university waiver</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 font-medium">Annual Living (Blocked Account)</span>
                    <p className="text-xl font-extrabold text-slate-900 mt-1">$12,850 / year</p>
                    <span className="text-[11px] text-slate-500 mt-1 block">Accommodation, food, insurance</span>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                    <span className="text-teal-800 font-medium">Net First-Year Out of Pocket</span>
                    <p className="text-xl font-extrabold text-teal-900 mt-1">$13,820</p>
                    <span className="text-[11px] text-teal-700 mt-1 block">Includes visa & settling-in fees</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900">Application Milestones</h3>
                  <span className="text-xs font-semibold text-teal-700">4 of 11 Tasks Completed (36%)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200 flex items-center text-emerald-800">
                    <FiCheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    <span className="font-semibold line-through">Check Eligibility & Degree Prerequisites</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-200 flex items-center text-emerald-800">
                    <FiCheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    <span className="font-semibold line-through">Prepare Academic Transcripts & Translations</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center text-slate-700">
                    <FiCalendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Request 2 Academic Recommendation Letters (Due: Oct 15)</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center text-slate-700">
                    <FiCalendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>Submit University Application Portal Entry (Due: Dec 15)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Core Concept Workflow */}
      <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              The NextAbroad AI Architecture
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              A continuous verification pipeline rather than a static, stale scholarship directory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900">Student Profile</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Records GPA, grading scale, IELTS/TOEFL scores, desired degree, and budget preferences.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900">Source Retrieval</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Prioritizes Tier-1 official university websites and government portals (DAAD, EU, SI).
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900">Deterministic Matching</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Strict backend logic validates hard GPA cutoffs and requirements without LLM guesswork.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900">Application Roadmap</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Step-by-step document preparation, verified deadlines, and progress checklist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust & Freshness Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-r from-slate-900 to-teal-950 rounded-2xl p-8 sm:p-12 text-white shadow-lg">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-teal-900/60 border border-teal-700 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <FiShield className="w-3.5 h-3.5" />
                <span>Source Provenance & Data Freshness</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Never miss a deadline or rely on stale opportunities.
              </h2>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                Every scholarship and university program on NextAbroad AI retains its primary source URL,
                source reliability classification (Tier 1/2/3), and last verified audit timestamp.
                Expired intake cycles are automatically flagged and archived.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Create Your Free Profile
                </Link>
                <Link
                  href="/assistant"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Ask StudyPath AI Advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
