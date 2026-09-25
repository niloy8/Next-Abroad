"use client";

import React from "react";
import Link from "next/link";
import { FiMapPin, FiAward, FiDollarSign, FiBookOpen, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { University } from "@/types";
import { SourceBadge } from "@/components/ui/SourceBadge";

interface UniversityCardProps {
  university: University;
}

export const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => {
  const minTuition = university.programs?.length
    ? Math.min(...university.programs.map((p) => p.tuition_annual))
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <SourceBadge
            tier={university.source?.tier || "TIER_1"}
            sourceUrl={university.website_url}
            sourceTitle={university.name}
          />
          {university.global_rank && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              QS #{university.global_rank}
            </span>
          )}
        </div>

        <Link href={`/universities/${university.id}`} className="group block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
            {university.name}
          </h3>
          <div className="flex items-center text-xs text-slate-500 mt-1">
            <FiMapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
            <span>
              {university.city}, {university.country} ({university.type})
            </span>
          </div>
        </Link>

        {university.overview && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {university.overview}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center">
            <FiBookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span>{university.programs?.length || 2} Programs Offered</span>
          </div>
          <div className="flex items-center">
            <FiDollarSign className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span>
              Tuition:{" "}
              {minTuition === 0
                ? "€0 / Free"
                : `${minTuition.toLocaleString()} ${university.currency}/yr`}
            </span>
          </div>
          <div className="flex items-center col-span-2">
            <FiAward className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span>
              Est. Living: {university.living_cost_annual.toLocaleString()} {university.currency}/yr
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <a
          href={university.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center"
        >
          Official Website
          <FiExternalLink className="w-3 h-3 ml-1" />
        </a>
        <Link
          href={`/universities/${university.id}`}
          className="text-xs text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center"
        >
          View Degree Options
          <FiArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};
