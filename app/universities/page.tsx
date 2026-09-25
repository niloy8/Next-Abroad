"use client";

import React, { useState, useEffect } from "react";
import { FiBookOpen, FiSearch, FiFilter } from "react-icons/fi";
import { api } from "@/lib/api";
import { University } from "@/types";
import { UniversityCard } from "@/components/university/UniversityCard";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("All");

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const data = await api.getUniversities({
        country: countryFilter !== "All" ? countryFilter : undefined,
      });
      setUniversities(data || []);
    } catch (err) {
      console.warn("Using offline universities data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniversities();
  }, [countryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <FiBookOpen className="w-3.5 h-3.5" />
          <span>Institutions Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Leading Research Universities & Institutes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          World-ranked universities with verified English-taught degree programs, tuition waiver structures,
          and documented admission standards.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Destination Country</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
          >
            <option value="All">All Countries</option>
            <option value="Germany">Germany</option>
            <option value="Sweden">Sweden</option>
            <option value="Switzerland">Switzerland</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading universities...</div>
      ) : universities.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No universities found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((uni) => (
            <UniversityCard key={uni.id} university={uni} />
          ))}
        </div>
      )}
    </div>
  );
}
