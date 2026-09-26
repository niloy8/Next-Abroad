"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiCompass, FiShield, FiCheckCircle, FiFileText, FiGlobe } from "react-icons/fi";

export const Footer = () => {
  const pathname = usePathname();

  // Do not render footer on full-height assistant chat page
  if (pathname === "/assistant") {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Provenance */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white">
                <FiCompass className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">NextAbroad AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI-powered international education and scholarship discovery engine. Grounded in deterministic
              eligibility verification and primary Tier-1 institutional sources.
            </p>
            <div className="flex items-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2">
              <FiShield className="w-4 h-4 mr-1.5 shrink-0 text-emerald-600" />
              <span>Strict No-Hallucination Policy. All data linked to official primary portals.</span>
            </div>
          </div>

          {/* Opportunities */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Opportunities
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/discover" className="hover:text-teal-700 transition-colors">
                  Live Opportunity Discovery
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-teal-700 transition-colors">
                  Fully Funded Scholarships
                </Link>
              </li>
              <li>
                <Link href="/universities" className="hover:text-teal-700 transition-colors">
                  Top Research Universities
                </Link>
              </li>
              <li>
                <Link href="/countries" className="hover:text-teal-700 transition-colors">
                  Country Guides & Benchmark Costs
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Planning */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Student Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/onboarding" className="hover:text-teal-700 transition-colors">
                  Profile & Academic Evaluation
                </Link>
              </li>
              <li>
                <Link href="/cv-upload" className="hover:text-teal-700 transition-colors">
                  CV Auto-Extractor
                </Link>
              </li>
              <li>
                <Link href="/plan" className="hover:text-teal-700 transition-colors">
                  Application Roadmap & Checklist
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-teal-700 transition-colors">
                  Ask StudyPath AI Advisor
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-teal-700 transition-colors">
                  Data Freshness & Provenance Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Source Verification Integrity */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Reliability Standards
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start">
                <FiCheckCircle className="w-3.5 h-3.5 mr-1.5 text-teal-600 mt-0.5 shrink-0" />
                <span>Tier 1: Verified University & Government Portals (DAAD, EU Commission, SI)</span>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="w-3.5 h-3.5 mr-1.5 text-teal-600 mt-0.5 shrink-0" />
                <span>Deterministic rules evaluate GPA cutoffs without LLM guesswork</span>
              </div>
              <div className="flex items-start">
                <FiCheckCircle className="w-3.5 h-3.5 mr-1.5 text-teal-600 mt-0.5 shrink-0" />
                <span>Expired deadlines automatically archived and flagged</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NextAbroad AI. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-3">
            <span>Primary Sources: Official Educational Authorities</span>
            <span>•</span>
            <span>Last Knowledge Verification: September 2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
