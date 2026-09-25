import React from "react";
import { FiCheckCircle, FiShield, FiExternalLink } from "react-icons/fi";
import { SourceTier } from "@/types";

interface SourceBadgeProps {
  tier: SourceTier;
  sourceUrl?: string;
  sourceTitle?: string;
  lastVerified?: string;
  showLink?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  tier,
  sourceUrl,
  sourceTitle,
  lastVerified,
  showLink = true,
}) => {
  let label = "Tier 1: Official Source";
  let badgeClass = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let icon = <FiShield className="w-3.5 h-3.5 text-emerald-600 mr-1" />;

  if (tier === "TIER_2") {
    label = "Tier 2: Accredited Portal";
    badgeClass = "bg-slate-100 text-slate-800 border-slate-200";
    icon = <FiCheckCircle className="w-3.5 h-3.5 text-slate-600 mr-1" />;
  } else if (tier === "TIER_3") {
    label = "Tier 3: Third-Party";
    badgeClass = "bg-amber-50 text-amber-800 border-amber-200";
    icon = <FiShield className="w-3.5 h-3.5 text-amber-600 mr-1" />;
  }

  return (
    <div className="inline-flex items-center space-x-1.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeClass}`}
        title={sourceTitle ? `Verified via ${sourceTitle}` : undefined}
      >
        {icon}
        {label}
      </span>
      {showLink && sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-emerald-700 inline-flex items-center transition-colors"
          title="Open official primary source"
        >
          <FiExternalLink className="w-3 h-3 ml-0.5" />
        </a>
      )}
    </div>
  );
};
