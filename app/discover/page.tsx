"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiCompass,
  FiShield,
  FiExternalLink,
  FiBookmark,
  FiCheck,
  FiInfo,
  FiArrowRight,
  FiBriefcase,
  FiGlobe,
  FiDollarSign,
  FiBookOpen,
  FiAward,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { DiscoveryItem } from "@/types";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EligibilityBadge } from "@/components/ui/EligibilityBadge";

// Currency Conversion Rates to USD base
const FX_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  CAD: 0.74,
  AUD: 0.66,
  SEK: 0.095,
  CHF: 1.12,
  JPY: 0.0067,
  KRW: 0.00075,
  BDT: 0.0084,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  SEK: "SEK ",
  CHF: "CHF ",
  JPY: "¥",
  KRW: "₩",
  BDT: "৳",
};

export default function DiscoverPage() {
  const { user, profile } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscoveryItem[]>([]);
  const [sourcesConsulted, setSourcesConsulted] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  // Student Profile & Research Parameters
  const [originCountry, setOriginCountry] = useState(profile?.nationality || "Bangladesh");
  const [destinationCountry, setDestinationCountry] = useState(profile?.preferred_countries?.[0] || "All");
  const [studentCgpa, setStudentCgpa] = useState<number>(profile?.cgpa || 3.4);
  const [studentIelts, setStudentIelts] = useState<number>(profile?.english_score || 7.0);
  const [targetDegree, setTargetDegree] = useState(profile?.desired_degree || "Master's");
  const [targetField, setTargetField] = useState(profile?.field_of_study || "Computer Science");

  // Post-Research Filters & Display Preferences
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [fundingFilter, setFundingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workRightsOnly, setWorkRightsOnly] = useState(false);
  const [maxTuitionUsd, setMaxTuitionUsd] = useState<number | "All">("All");

  const performSearch = async (overrideParams?: any) => {
    setLoading(true);
    try {
      const dest = overrideParams?.destinationCountry !== undefined ? overrideParams.destinationCountry : destinationCountry;
      const deg = overrideParams?.targetDegree !== undefined ? overrideParams.targetDegree : targetDegree;
      const field = overrideParams?.targetField !== undefined ? overrideParams.targetField : targetField;
      const fund = overrideParams?.fundingFilter !== undefined ? overrideParams.fundingFilter : fundingFilter;
      const status = overrideParams?.statusFilter !== undefined ? overrideParams.statusFilter : statusFilter;
      const origin = overrideParams?.originCountry !== undefined ? overrideParams.originCountry : originCountry;
      const cgpa = overrideParams?.studentCgpa !== undefined ? overrideParams.studentCgpa : studentCgpa;
      const ielts = overrideParams?.studentIelts !== undefined ? overrideParams.studentIelts : studentIelts;

      const data = await api.discover({
        query: query.trim() || undefined,
        filters: {
          country: dest !== "All" ? dest : undefined,
          degree_level: deg !== "All" ? deg : undefined,
          field_of_study: field !== "All" ? field : undefined,
          funding_type: fund !== "All" ? fund : undefined,
          status: status !== "All" ? status : undefined,
          origin_country: origin || undefined,
          student_cgpa: Number(cgpa) || undefined,
          student_ielts: Number(ielts) || undefined,
          allows_work: workRightsOnly || undefined,
        },
        include_web_retrieval: true,
      });

      setResults(data.results || []);
      setSourcesConsulted(data.sources_consulted || []);
    } catch (err) {
      console.warn("Error running discovery search:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleSave = async (item: DiscoveryItem) => {
    if (savedIds.includes(item.id)) return;
    try {
      await api.saveOpportunity({
        opportunity_type: item.type,
        opportunity_id: item.id,
        title: item.title,
        subtitle: item.organization,
        country: item.country,
        deadline: item.deadline,
      });
      setSavedIds((prev) => [...prev, item.id]);
    } catch (e) {
      setSavedIds((prev) => [...prev, item.id]);
    }
  };

  // Convert an amount from its original currency to the active selected currency
  const formatCost = (amount: number, origCurrency: string) => {
    if (!amount || amount === 0) return "Free / 100% Waived";
    const toUsd = FX_TO_USD[origCurrency?.toUpperCase()] || 1.0;
    const usdVal = amount * toUsd;
    const targetFx = FX_TO_USD[selectedCurrency] || 1.0;
    const converted = usdVal / targetFx;
    const sym = CURRENCY_SYMBOLS[selectedCurrency] || "$";
    return `${sym}${Math.round(converted).toLocaleString()} / year`;
  };

  // Filtered results based on client-side instant tuition affordability & work filters
  const displayedResults = useMemo(() => {
    return results.filter((item) => {
      // Work rights filter
      if (workRightsOnly) {
        if (!item.visa_work_rights || item.visa_work_rights.toLowerCase().includes("no work")) {
          return false;
        }
      }

      // Max tuition filter
      if (maxTuitionUsd !== "All") {
        const itemToUsd = FX_TO_USD[item.currency?.toUpperCase()] || 1.0;
        const itemUsd = (item.tuition_annual || 0) * itemToUsd;
        if (itemUsd > maxTuitionUsd) {
          return false;
        }
      }

      return true;
    });
  }, [results, workRightsOnly, maxTuitionUsd]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <FiCompass className="w-3.5 h-3.5" />
          <span>Real-time Opportunity Research Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Study Abroad Opportunities & Scholarships
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Enter your current country, target destination, academic CGPA, and English scores to evaluate every verified university program and scholarship with official links and work rights.
        </p>
      </div>

      {/* 1. Guided Opportunity Research Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FiSearch className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900">Your Academic Profile & Research Parameters</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Matches verified directly against official admission criteria
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            performSearch();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Current Country (Origin / Citizenship) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center">
                <FiGlobe className="w-3 h-3 mr-1 text-teal-700" />
                Current Country (Citizenship)
              </label>
              <select
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-600 focus:bg-white focus:outline-none"
              >
                <option value="Bangladesh">Bangladesh</option>
                <option value="India">India</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Kenya">Kenya</option>
                <option value="Ghana">Ghana</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Brazil">Brazil</option>
                <option value="Nepal">Nepal</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Egypt">Egypt</option>
                <option value="Colombia">Colombia</option>
                <option value="Philippines">Philippines</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="International (Other)">International (Other)</option>
              </select>
            </div>

            {/* Destination Country */}
            <div>
              <label className=" text-[11px] font-semibold text-slate-700 mb-1 flex items-center">
                <FiCompass className="w-3 h-3 mr-1 text-teal-700" />
                Where Do You Want to Go?
              </label>
              <select
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-600 focus:bg-white focus:outline-none"
              >
                <option value="All">All Destination Countries</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Sweden">Sweden</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Ireland">Ireland</option>
                <option value="France">France</option>
                <option value="Finland">Finland</option>
                <option value="Italy">Italy</option>
                <option value="Japan">Japan</option>
                <option value="South Korea">South Korea</option>
                <option value="European Union">European Union (Joint EMJM)</option>
              </select>
            </div>

            {/* Your Academic CGPA */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center">
                <FiBookOpen className="w-3 h-3 mr-1 text-teal-700" />
                Your Bachelor&apos;s / Current CGPA
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  min="2.0"
                  max="4.0"
                  value={studentCgpa}
                  onChange={(e) => setStudentCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-600 focus:bg-white focus:outline-none"
                  placeholder="e.g. 3.4"
                />
                <span className="text-slate-400 text-xs font-semibold shrink-0">/ 4.0</span>
              </div>
            </div>

            {/* English Proficiency */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center">
                <FiAward className="w-3 h-3 mr-1 text-teal-700" />
                English Score (IELTS / Equiv)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="9.0"
                  value={studentIelts}
                  onChange={(e) => setStudentIelts(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-600 focus:bg-white focus:outline-none"
                  placeholder="e.g. 7.0"
                />
                <span className="text-slate-400 text-xs font-semibold shrink-0">Band</span>
              </div>
            </div>
          </div>

          {/* Row 2: Target Degree, Field of Study, and Search Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Degree</label>
              <select
                value={targetDegree}
                onChange={(e) => setTargetDegree(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-600 focus:bg-white focus:outline-none"
              >
                <option value="All">All Degrees</option>
                <option value="Master's">Master&apos;s</option>
                <option value="Bachelor's">Bachelor&apos;s</option>
                <option value="PhD">PhD / Doctorate</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Field of Study</label>
              <input
                type="text"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                placeholder="e.g. Computer Science, Artificial Intelligence, Data Science, Public Policy"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <FiSearch className="w-3.5 h-3.5" />
                <span>{loading ? "Evaluating Opportunities..." : "Run Opportunity Research"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2. Interactive Filter & Currency Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <FiFilter className="w-3.5 h-3.5 text-teal-700" />
            <span>Refine by Work Rights, Currency & Affordability</span>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center">
              <FiDollarSign className="w-3 h-3 mr-0.5 text-teal-700" />
              Display Currency:
            </span>
            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
              {["USD", "EUR", "GBP", "CAD", "AUD", "BDT"].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${selectedCurrency === curr
                      ? "bg-teal-700 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Work Rights Preference */}
          <div>
            <label className="text-[11px] text-slate-500 font-semibold mb-1 flex items-center">
              <FiBriefcase className="w-3 h-3 mr-1 text-teal-700" />
              Work Rights / Visa
            </label>
            <select
              value={workRightsOnly ? "yes" : "all"}
              onChange={(e) => setWorkRightsOnly(e.target.value === "yes")}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="all">All Opportunities</option>
              <option value="yes">Part-time & Post-Study Work Rights Only</option>
            </select>
          </div>

          {/* Tuition Fee Affordability */}
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Tuition Affordability</label>
            <select
              value={maxTuitionUsd}
              onChange={(e) => setMaxTuitionUsd(e.target.value === "All" ? "All" : Number(e.target.value))}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">Any Tuition Budget</option>
              <option value="0">100% Free / Fully Funded ($0)</option>
              <option value="3000">Under $3,000 USD / year</option>
              <option value="10000">Under $10,000 USD / year</option>
              <option value="25000">Under $25,000 USD / year</option>
            </select>
          </div>

          {/* Scholarship Funding Type */}
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Scholarship Type</label>
            <select
              value={fundingFilter}
              onChange={(e) => {
                setFundingFilter(e.target.value);
                performSearch({ fundingFilter: e.target.value });
              }}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Funding Options</option>
              <option value="Fully Funded">Fully Funded (Tuition + Stipend)</option>
              <option value="Tuition Waiver">Tuition Waiver / Free Public</option>
              <option value="Partial Scholarship">Partial Scholarship</option>
            </select>
          </div>

          {/* Opportunity Application Status */}
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Application Cycle</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                performSearch({ statusFilter: e.target.value });
              }}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Cycles (Open & Upcoming)</option>
              <option value="OPEN">Open Now</option>
              <option value="UPCOMING">Upcoming Cycle</option>
              <option value="EXPIRED">Archived / Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900">{displayedResults.length}</span> verified results for applicants from{" "}
          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {originCountry}
          </span>{" "}
          {destinationCountry !== "All" && (
            <>
              heading to <span className="font-semibold text-slate-800">{destinationCountry}</span>
            </>
          )}
        </p>

        {sourcesConsulted.length > 0 && (
          <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            {sourcesConsulted.length} Primary Government & Institutional Sources Verified
          </span>
        )}
      </div>

      {/* Discovery Results List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-teal-700 border-t-transparent animate-spin"></div>
          <p>Evaluating verified university guidelines, national scholarship eligibility, and visa work rights...</p>
        </div>
      ) : displayedResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FiSearch className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No matching opportunities found for your criteria</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try selecting &quot;All Destination Countries&quot;, increasing your tuition budget filter, or broadening your field of study.
          </p>
          <button
            onClick={() => {
              setDestinationCountry("All");
              setMaxTuitionUsd("All");
              setFundingFilter("All");
              setWorkRightsOnly(false);
              performSearch({ destinationCountry: "All", fundingFilter: "All" });
            }}
            className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedResults.map((item) => (
            <div
              key={item.id + item.type}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition"
            >
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} deadline={item.deadline} />
                  {item.match_category === "AI Live Researched" && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center shadow-xs">
                      <FiCompass className="w-3 h-3 mr-1 text-indigo-600" />
                      AI Live Researched
                    </span>
                  )}
                  <SourceBadge
                    tier={item.source_tier}
                    sourceUrl={item.source_url}
                    sourceTitle={item.organization}
                  />
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 flex items-center">
                    <FiGlobe className="w-3 h-3 mr-1 text-slate-500" />
                    {item.country}
                  </span>
                  {item.funding_type && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 border border-teal-200 text-teal-800">
                      {item.funding_type}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleSave(item)}
                  disabled={savedIds.includes(item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center transition cursor-pointer ${savedIds.includes(item.id)
                      ? "bg-teal-50 border-teal-200 text-teal-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {savedIds.includes(item.id) ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                      Saved to Plan
                    </>
                  ) : (
                    <>
                      <FiBookmark className="w-3.5 h-3.5 mr-1" />
                      Save Opportunity
                    </>
                  )}
                </button>
              </div>

              {/* Title & Core Information */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">{item.organization}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Degree: <span className="font-semibold text-slate-700">{item.degree_level}</span> •
                    Field: <span className="font-semibold text-slate-700">{item.field_of_study}</span>
                  </p>
                </div>

                {/* Costs & Eligibility Box */}
                <div className="shrink-0 text-left md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Estimated Tuition</span>
                  <span className="text-sm font-extrabold text-teal-800">
                    {formatCost(item.tuition_annual, item.currency)}
                  </span>
                  <div className="mt-2">
                    <EligibilityBadge eligibility={item.eligibility} />
                  </div>
                </div>
              </div>

              {/* Work Rights & Visa Information Banner */}
              {item.visa_work_rights && (
                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <div className="flex items-center text-slate-700 font-medium">
                    <FiBriefcase className="w-3.5 h-3.5 mr-1.5 text-teal-700 shrink-0" />
                    <span>
                      <strong className="text-slate-900">Work Rights:</strong> {item.visa_work_rights}
                    </span>
                  </div>
                  {item.post_study_work_visa && (
                    <div className="flex items-center text-slate-600">
                      <FiClock className="w-3.5 h-3.5 mr-1.5 text-indigo-600 shrink-0" />
                      <span>
                        <strong className="text-slate-900">Post-Study Visa:</strong> {item.post_study_work_visa}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Match Criteria Evaluation Summary */}
              {item.eligibility && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600 flex items-center">
                    <FiInfo className="w-3.5 h-3.5 mr-1.5 text-teal-700 shrink-0" />
                    <span>
                      <strong>Eligibility Check:</strong> {item.match_explanation || "Verified against institutional criteria."}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {item.match_category === "AI Live Researched" || item.id >= 9000 ? (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs inline-flex items-center transition shadow-xs"
                      >
                        Official Application Portal <FiExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    ) : (
                      <>
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-slate-900 inline-flex items-center font-medium transition"
                          title="Direct official source portal"
                        >
                          Official Source <FiExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        {item.type === "scholarship" ? (
                          <Link
                            href={`/scholarships/${item.id}`}
                            className="text-teal-700 hover:text-teal-900 font-bold inline-flex items-center transition"
                          >
                            Application Details <FiArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        ) : (
                          <Link
                            href={`/universities/${item.id}`}
                            className="text-teal-700 hover:text-teal-900 font-bold inline-flex items-center transition"
                          >
                            University Details <FiArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
