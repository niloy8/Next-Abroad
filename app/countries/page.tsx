"use client";

import React, { useEffect, useState } from "react";
import { FiGlobe, FiDollarSign, FiClock, FiBriefcase, FiCheck } from "react-icons/fi";
import { api } from "@/lib/api";
import { Country } from "@/types";

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getCountries();
        setCountries(data || []);
      } catch (err) {
        console.warn("Could not load countries:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <FiGlobe className="w-3.5 h-3.5" />
          <span>Destination Guides</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Country Guides & Benchmark Living Costs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Compare tuition structures, mandatory blocked accounts, visa student work rights, and post-study
          employment permits across primary destinations.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading destination data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((c) => (
            <div key={c.code} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {c.currency}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{c.description}</p>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Average Annual Tuition</span>
                    <span className="font-bold text-slate-800">
                      {c.avg_tuition_min === 0 ? "€0 / Free at Public Unis" : `${c.avg_tuition_min.toLocaleString()} - ${c.avg_tuition_max.toLocaleString()} ${c.currency}`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Est. Living Expenses</span>
                    <span className="font-bold text-slate-800">
                      {c.avg_living_annual_min.toLocaleString()} - {c.avg_living_annual_max.toLocaleString()} {c.currency}/year
                    </span>
                  </div>

                  {c.blocked_account_required > 0 && (
                    <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                      <span className="text-teal-700 block text-[11px] font-semibold">Mandatory Blocked Account / Proof</span>
                      <span className="font-bold">
                        {c.blocked_account_required.toLocaleString()} {c.currency} for visa
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-slate-400 block text-[11px] font-semibold">Student Work Rights:</span>
                    <span className="text-slate-700">{c.visa_work_rights}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Post-Study Search Visa:</span>
                    <span className="text-slate-700">{c.post_study_work_visa}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`/discover?country=${c.name}`}
                  className="w-full text-center py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold block transition"
                >
                  Explore {c.name} Opportunities
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
