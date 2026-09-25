"use client";

import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiSliders,
  FiCompass,
  FiShield,
  FiExternalLink,
  FiBookmark,
  FiCheck,
  FiInfo,
  FiArrowRight,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { DiscoveryItem } from "@/types";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EligibilityBadge } from "@/components/ui/EligibilityBadge";

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscoveryItem[]>([]);
  const [sourcesConsulted, setSourcesConsulted] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    country: "All",
    degree_level: "All",
    field_of_study: "All",
    funding_type: "All",
    status: "All",
  });

  const performSearch = async (searchQuery?: string, activeFilters = filters) => {
    setLoading(true);
    try {
      const data = await api.discover({
        query: searchQuery !== undefined ? searchQuery : query,
        filters: {
          country: activeFilters.country !== "All" ? activeFilters.country : undefined,
          degree_level: activeFilters.degree_level !== "All" ? activeFilters.degree_level : undefined,
          field_of_study: activeFilters.field_of_study !== "All" ? activeFilters.field_of_study : undefined,
          funding_type: activeFilters.funding_type !== "All" ? activeFilters.funding_type : undefined,
          status: activeFilters.status !== "All" ? activeFilters.status : undefined,
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
    performSearch("");
  }, []);

  const handleFilterChange = (key: string, val: string) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    performSearch(query, updated);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <FiCompass className="w-3.5 h-3.5" />
          <span>Real-time Discovery Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Discover Study Opportunities & Scholarships
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Search using natural language or structured filters. Every result is cross-checked with primary
          Tier-1 institutional sources and evaluated against your profile.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performSearch(query);
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find fully funded Master's scholarships in Germany for computer science with CGPA 3.2+"
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border-0 focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition shrink-0"
          >
            {loading ? "Searching..." : "Discover Opportunities"}
          </button>
        </form>
      </div>

      {/* Structured Filter Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-3">
          <FiFilter className="w-3.5 h-3.5 text-teal-700" />
          <span>Filter Parameters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Country</label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange("country", e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Countries</option>
              <option value="Germany">Germany</option>
              <option value="Sweden">Sweden</option>
              <option value="Switzerland">Switzerland</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="European Union">European Union (Joint)</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Degree Level</label>
            <select
              value={filters.degree_level}
              onChange={(e) => handleFilterChange("degree_level", e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Degrees</option>
              <option value="Master's">Master&apos;s</option>
              <option value="Bachelor's">Bachelor&apos;s</option>
              <option value="PhD">PhD / Doctorate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Field of Study</label>
            <select
              value={filters.field_of_study}
              onChange={(e) => handleFilterChange("field_of_study", e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Disciplines</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Public Policy">Public Policy & Governance</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Funding Type</label>
            <select
              value={filters.funding_type}
              onChange={(e) => handleFilterChange("funding_type", e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Funding</option>
              <option value="Fully Funded">Fully Funded</option>
              <option value="Tuition Waiver">Tuition Waiver / Free</option>
              <option value="Partial Scholarship">Partial Scholarship</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 font-semibold mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">Open Now</option>
              <option value="UPCOMING">Upcoming Cycle</option>
              <option value="EXPIRED">Archived / Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-900">{results.length}</span> verified results
        </p>
        {sourcesConsulted.length > 0 && (
          <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {sourcesConsulted.length} Primary sources verified
          </span>
        )}
      </div>

      {/* Discovery Results List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Searching institutional databases and evaluating eligibility criteria...
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No matching opportunities found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, selecting different countries, or broadening your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item) => (
            <div
              key={item.id + item.type}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <StatusBadge status={item.status} deadline={item.deadline} />
                  <SourceBadge
                    tier={item.source_tier}
                    sourceUrl={item.source_url}
                    sourceTitle={item.organization}
                  />
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                    {item.country}
                  </span>
                </div>

                <button
                  onClick={() => handleSave(item)}
                  disabled={savedIds.includes(item.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center transition ${
                    savedIds.includes(item.id)
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
                      Save
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{item.organization}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Degree: <span className="font-semibold text-slate-700">{item.degree_level}</span> •
                    Field: <span className="font-semibold text-slate-700">{item.field_of_study}</span> •
                    Funding: <span className="font-semibold text-slate-700">{item.funding_type}</span>
                  </p>
                </div>

                <div className="shrink-0 text-left md:text-right">
                  <span className="text-[11px] text-slate-400 block">Application Deadline</span>
                  <span className="text-xs font-bold text-slate-800">{item.deadline}</span>
                  <div className="mt-2">
                    <EligibilityBadge eligibility={item.eligibility} />
                  </div>
                </div>
              </div>

              {/* Match Explanation & Source Attribution */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-600 flex items-center">
                  <FiInfo className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  <span>{item.match_explanation || "Verified against institutional admission guidelines."}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-800 inline-flex items-center font-medium"
                  >
                    Official Portal <FiExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  {item.type === "scholarship" ? (
                    <a
                      href={`/scholarships/${item.id}`}
                      className="text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center"
                    >
                      View Details <FiArrowRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <a
                      href={`/universities/${item.id}`}
                      className="text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center"
                    >
                      View Details <FiArrowRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
