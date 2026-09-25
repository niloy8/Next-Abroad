import React from "react";
import { FiClock, FiCalendar, FiAlertCircle, FiCheck, FiHelpCircle } from "react-icons/fi";
import { OpportunityStatus } from "@/types";

interface StatusBadgeProps {
  status: OpportunityStatus;
  deadline?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, deadline }) => {
  let badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let icon = <FiCheck className="w-3.5 h-3.5 mr-1" />;
  let text = "OPEN";

  if (status === "UPCOMING") {
    badgeStyle = "bg-blue-50 text-blue-800 border-blue-200";
    icon = <FiCalendar className="w-3.5 h-3.5 mr-1" />;
    text = "UPCOMING";
  } else if (status === "EXPIRED") {
    badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
    icon = <FiAlertCircle className="w-3.5 h-3.5 mr-1" />;
    text = "EXPIRED";
  } else if (status === "ROLLING") {
    badgeStyle = "bg-purple-50 text-purple-800 border-purple-200";
    icon = <FiClock className="w-3.5 h-3.5 mr-1" />;
    text = "ROLLING ADMISSION";
  } else if (status === "UNKNOWN") {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
    icon = <FiHelpCircle className="w-3.5 h-3.5 mr-1" />;
    text = "Status could not be verified";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeStyle}`}>
      {icon}
      {text}
    </span>
  );
};
