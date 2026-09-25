import React, { useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo } from "react-icons/fi";
import { EligibilityResult, EligibilityStatus } from "@/types";

interface EligibilityBadgeProps {
  eligibility?: EligibilityResult;
  status?: EligibilityStatus;
  reason?: string;
  showModalTrigger?: boolean;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  eligibility,
  status = eligibility?.overall_status || "Potentially Eligible",
  reason = eligibility?.summary_reason,
  showModalTrigger = true,
}) => {
  const [openModal, setOpenModal] = useState(false);

  let style = "bg-amber-50 text-amber-800 border-amber-200";
  let icon = <FiAlertTriangle className="w-3.5 h-3.5 mr-1" />;
  let label = "Potentially Eligible";

  if (status === "Eligible") {
    style = "bg-emerald-50 text-emerald-800 border-emerald-200";
    icon = <FiCheckCircle className="w-3.5 h-3.5 mr-1" />;
    label = "Eligible";
  } else if (status === "Not Eligible") {
    style = "bg-rose-50 text-rose-800 border-rose-200";
    icon = <FiXCircle className="w-3.5 h-3.5 mr-1" />;
    label = "Not Eligible";
  }

  return (
    <>
      <div className="inline-flex items-center space-x-1.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style}`}>
          {icon}
          {label}
        </span>
        {showModalTrigger && eligibility && (
          <button
            onClick={() => setOpenModal(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
            title="View criteria breakdown"
            type="button"
          >
            <FiInfo className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Criteria Breakdown Modal */}
      {openModal && eligibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">
                Eligibility Evaluation Breakdown
              </h3>
              <button
                onClick={() => setOpenModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4">
                <div className="flex items-center mb-1">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded mr-2 border ${style}`}>
                    {status}
                  </span>
                  <span className="text-xs text-slate-500">Deterministic Rule Calculation</span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{reason}</p>
              </div>

              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Criteria Checks
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {eligibility.criteria_checks?.map((check, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{check.criterion}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[11px] font-medium ${
                          check.passed
                            ? "bg-emerald-50 text-emerald-700"
                            : check.status === "Needs Verification"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-1">
                      <div>
                        <span className="text-slate-400">Required: </span>
                        {check.required}
                      </div>
                      <div>
                        <span className="text-slate-400">Your Profile: </span>
                        {check.actual}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">{check.details}</p>
                  </div>
                ))}
              </div>

              {eligibility.actionable_advice && (
                <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-800">
                  <span className="font-semibold">Next Step: </span>
                  {eligibility.actionable_advice}
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
