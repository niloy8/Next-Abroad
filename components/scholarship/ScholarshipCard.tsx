"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiBookmark,
  FiCheck,
  FiExternalLink,
  FiArrowRight,
  FiAward,
} from "react-icons/fi";
import { Scholarship, EligibilityResult } from "@/types";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EligibilityBadge } from "@/components/ui/EligibilityBadge";
import { api } from "@/lib/api";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  eligibility?: EligibilityResult;
  onSaved?: () => void;
}

export const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  eligibility,
  onSaved,
}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (saved) return;
    setSaving(true);
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
      if (onSaved) onSaved();
    } catch (err) {
      setSaved(true); // Optimistic local save
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <StatusBadge status={scholarship.status} deadline={scholarship.application_deadline} />
            <SourceBadge
              tier={scholarship.source?.tier || "TIER_1"}
              sourceUrl={scholarship.official_application_url}
              sourceTitle={scholarship.provider}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`p-1.5 rounded-lg border text-xs font-medium inline-flex items-center transition ${
              saved
                ? "bg-teal-50 border-teal-200 text-teal-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title={saved ? "Saved to your application plan" : "Save to plan"}
          >
            {saved ? (
              <>
                <FiCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                Saved
              </>
            ) : (
              <>
                <FiBookmark className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Save
              </>
            )}
          </button>
        </div>

        {/* Title & Organization */}
        <Link href={`/scholarships/${scholarship.id}`} className="group block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
            {scholarship.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">{scholarship.provider}</p>
        </Link>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center">
            <FiMapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{scholarship.country}</span>
          </div>
          <div className="flex items-center">
            <FiAward className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">{scholarship.funding_type}</span>
          </div>
          <div className="flex items-center">
            <FiDollarSign className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span>
              {scholarship.monthly_stipend
                ? `${scholarship.monthly_stipend.toLocaleString()} ${scholarship.stipend_currency}/mo`
                : "Full Tuition Coverage"}
            </span>
          </div>
          <div className="flex items-center">
            <FiCalendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
            <span className="truncate">Deadline: {scholarship.application_deadline}</span>
          </div>
        </div>

        {/* Eligibility Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Your Eligibility:</span>
          <EligibilityBadge eligibility={eligibility} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <a
          href={scholarship.official_application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center"
        >
          Official Portal
          <FiExternalLink className="w-3 h-3 ml-1" />
        </a>
        <Link
          href={`/scholarships/${scholarship.id}`}
          className="text-xs text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center"
        >
          View Full Details
          <FiArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};
