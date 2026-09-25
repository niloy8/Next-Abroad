"use client";

import React, { useState, useEffect } from "react";
import { FiAward, FiSearch, FiFilter } from "react-icons/fi";
import { api } from "@/lib/api";
import { Scholarship } from "@/types";
import { ScholarshipCard } from "@/components/scholarship/ScholarshipCard";

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("All");
  const [fundingFilter, setFundingFilter] = useState("All");

  const loadScholarships = async () => {
    setLoading(true);
    try {
      const data = await api.getScholarships({
        country: countryFilter !== "All" ? countryFilter : undefined,
        funding_type: fundingFilter !== "All" ? fundingFilter : undefined,
      });
      setScholarships(data || []);
    } catch (err) {
      console.warn("Using offline scholarships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, [countryFilter, fundingFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <FiAward className="w-3.5 h-3.5" />
          <span>Verified Funding Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          International Scholarships & Fellowships
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Verified government, university, and foundation scholarships with documented eligibility criteria,
          stipend details, and direct official application links.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
          >
            <option value="All">All Countries</option>
            <option value="Germany">Germany</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
            <option value="European Union">European Union</option>
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Funding Type</label>
          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
          >
            <option value="All">All Funding Types</option>
            <option value="Fully Funded">Fully Funded</option>
            <option value="Tuition Waiver">Tuition Waiver</option>
            <option value="Partial Scholarship">Partial Scholarship</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading verified scholarships...</div>
      ) : scholarships.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No scholarships found matching selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch) => (
            <ScholarshipCard key={sch.id} scholarship={sch} />
          ))}
        </div>
      )}
    </div>
  );
}
