"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiMapPin,
  FiBookOpen,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiExternalLink,
  FiAward,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { University } from "@/types";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function UniversityDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const u = await api.getUniversityById(id);
        setUniversity(u);
      } catch (err) {
        console.warn("Could not load university:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-400">Loading university details...</div>;
  }

  if (!university) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">University Not Found</h2>
        <Link href="/universities" className="text-xs text-teal-700 font-semibold mt-2 inline-block">
          ← Return to Universities Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/universities"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <FiArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Universities
      </Link>

      {/* Main Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <SourceBadge
            tier={university.source?.tier || "TIER_1"}
            sourceUrl={university.website_url}
            sourceTitle={university.name}
          />
          {university.global_rank && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              QS World Rank #{university.global_rank}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {university.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 flex items-center mt-1">
          <FiMapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {university.city}, {university.country} • {university.type} University
        </p>

        {university.overview && (
          <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
            {university.overview}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Estimated Living Cost</span>
            <span className="font-bold text-slate-800">
              {university.living_cost_annual.toLocaleString()} {university.currency} / year
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Programs Offered</span>
            <span className="font-bold text-slate-800">{university.programs?.length || 2} Degree Tracks</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Acceptance Rate</span>
            <span className="font-bold text-slate-800">
              {university.acceptance_rate ? `${Math.round(university.acceptance_rate * 100)}%` : "Selective"}
            </span>
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center">
          <FiBookOpen className="w-4 h-4 mr-2 text-teal-600" />
          Available Degree Programs
        </h2>

        {university.programs?.map((prog) => (
          <div key={prog.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <StatusBadge status={prog.status} deadline={prog.application_deadline} />
              <span className="text-xs font-semibold text-slate-500">Intake: {prog.intake}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{prog.name}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Field: <span className="font-semibold">{prog.field_of_study}</span> • Degree:{" "}
              <span className="font-semibold">{prog.degree_level}</span> • Duration: {prog.duration_months} Months
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Annual Tuition</span>
                <span className="font-bold text-slate-800">
                  {prog.tuition_annual === 0 ? "€0 (Tuition-free)" : `${prog.tuition_annual.toLocaleString()} ${prog.currency}`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Min CGPA</span>
                <span className="font-bold text-slate-800">{prog.min_cgpa.toFixed(2)}/4.0</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Min IELTS</span>
                <span className="font-bold text-slate-800">Band {prog.min_ielts}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Application Deadline</span>
                <span className="font-bold text-rose-700">{prog.application_deadline}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Instruction Language: {prog.language}</span>
              <a
                href={prog.application_url || university.admissions_url || university.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center"
              >
                Official Program Admissions <FiExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
