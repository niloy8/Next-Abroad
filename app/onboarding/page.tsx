"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiBookOpen,
  FiAward,
  FiDollarSign,
  FiSliders,
  FiCalendar,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const STEPS = [
  { id: 1, title: "Personal", icon: FiUser },
  { id: 2, title: "Academic", icon: FiBookOpen },
  { id: 3, title: "Language", icon: FiAward },
  { id: 4, title: "Budget", icon: FiDollarSign },
  { id: 5, title: "Preferences", icon: FiSliders },
  { id: 6, title: "Intake", icon: FiCalendar },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal
    nationality: profile?.nationality || "Bangladesh",
    country_of_residence: profile?.country_of_residence || "Bangladesh",

    // Academic
    current_degree: profile?.current_degree || "Bachelor's in Computer Science",
    desired_degree: profile?.desired_degree || "Master's",
    field_of_study: profile?.field_of_study || "Computer Science",
    institution: profile?.institution || "University of Dhaka",
    cgpa: profile?.cgpa || 3.42,
    grading_scale: profile?.grading_scale || 4.0,
    graduation_year: profile?.graduation_year || 2025,

    // English
    english_test: profile?.english_test || "IELTS",
    english_score: profile?.english_score || 7.0,

    // Budget
    max_annual_tuition: profile?.max_annual_tuition || 3000,
    max_annual_living: profile?.max_annual_living || 12000,
    currency: profile?.currency || "EUR",

    // Preferences
    preferred_countries: profile?.preferred_countries || ["Germany", "Sweden", "Switzerland"],
    preferred_cities: profile?.preferred_cities || ["Munich", "Berlin", "Stockholm", "Zurich"],
    scholarship_required: profile?.scholarship_required ?? true,
    fully_funded_preference: profile?.fully_funded_preference ?? true,
    partial_scholarship_acceptable: profile?.partial_scholarship_acceptable ?? true,
    tuition_waiver_preference: profile?.tuition_waiver_preference ?? true,
    part_time_work_preference: profile?.part_time_work_preference ?? true,
    research_preference: profile?.research_preference ?? true,
    public_private_preference: profile?.public_private_preference || "Public",

    // Intake
    preferred_intake: profile?.preferred_intake || "Fall 2026",
  });

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCountryToggle = (country: string) => {
    const list = [...formData.preferred_countries];
    const index = list.indexOf(country);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(country);
    }
    updateField("preferred_countries", list);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      router.push("/dashboard");
    } catch (err) {
      // Offline fallback: redirect directly
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Stepper Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Student Profile Onboarding</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your profile to enable deterministic eligibility evaluation and cost analysis.
        </p>

        <div className="grid grid-cols-6 gap-2 mt-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center p-2 rounded-lg border text-xs font-semibold transition ${
                  isCurrent
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : isDone
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isCurrent ? "text-teal-700" : isDone ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="hidden sm:inline text-[11px]">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Form Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step 1: Personal */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality (for visa & scholarship eligibility)
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => updateField("nationality", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. Bangladesh, India, Nigeria"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country of Residence
                </label>
                <input
                  type="text"
                  value={formData.country_of_residence}
                  onChange={(e) => updateField("country_of_residence", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. Bangladesh"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Academic */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Academic Background
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current / Highest Degree
                </label>
                <input
                  type="text"
                  value={formData.current_degree}
                  onChange={(e) => updateField("current_degree", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. Bachelor's in Computer Science"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Degree Level
                </label>
                <select
                  value={formData.desired_degree}
                  onChange={(e) => updateField("desired_degree", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="Master's">Master&apos;s</option>
                  <option value="Bachelor's">Bachelor&apos;s</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Postdoctoral">Postdoctoral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={formData.field_of_study}
                  onChange={(e) => updateField("field_of_study", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. Computer Science, Public Policy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution Attended
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. University of Dhaka"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cumulative GPA (CGPA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => updateField("cgpa", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grading Scale
                </label>
                <select
                  value={formData.grading_scale}
                  onChange={(e) => updateField("grading_scale", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                >
                  <option value={4.0}>4.0 Scale (Standard)</option>
                  <option value={5.0}>5.0 Scale</option>
                  <option value={10.0}>10.0 Scale</option>
                  <option value={100.0}>100% Scale</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => updateField("graduation_year", parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Language */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              English Language Proficiency
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  English Proficiency Test
                </label>
                <select
                  value={formData.english_test}
                  onChange={(e) => updateField("english_test", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="IELTS">IELTS Academic</option>
                  <option value="TOEFL">TOEFL iBT</option>
                  <option value="PTE">PTE Academic</option>
                  <option value="Duolingo">Duolingo English Test (DET)</option>
                  <option value="Other">Other / Medium of Instruction</option>
                  <option value="Not taken yet">Not taken yet</option>
                </select>
              </div>
              {formData.english_test !== "Not taken yet" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Overall Band / Score
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.english_score}
                    onChange={(e) => updateField("english_score", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                    placeholder="e.g. 7.0 for IELTS, 95 for TOEFL"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 italic mt-2">
              Note: Minimum band requirements are deterministically verified against official admissions guidelines.
            </p>
          </div>
        )}

        {/* Step 4: Budget */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Financial Budget & Capacity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="SEK">SEK (kr)</option>
                  <option value="BDT">BDT (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Annual Tuition Budget
                </label>
                <input
                  type="number"
                  value={formData.max_annual_tuition}
                  onChange={(e) => updateField("max_annual_tuition", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. 0 for tuition-free"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Annual Living Budget
                </label>
                <input
                  type="number"
                  value={formData.max_annual_living}
                  onChange={(e) => updateField("max_annual_living", parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="e.g. 12000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Preferences */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Study Preferences
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Preferred Study Destinations
              </label>
              <div className="flex flex-wrap gap-2">
                {["Germany", "Sweden", "Switzerland", "Canada", "United Kingdom", "Netherlands", "Finland", "Australia"].map(
                  (c) => {
                    const selected = formData.preferred_countries.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => handleCountryToggle(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          selected
                            ? "bg-teal-700 text-white border-teal-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.scholarship_required}
                  onChange={(e) => updateField("scholarship_required", e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">Scholarship strictly required</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.part_time_work_preference}
                  onChange={(e) => updateField("part_time_work_preference", e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">Part-time student work rights required</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tuition_waiver_preference}
                  onChange={(e) => updateField("tuition_waiver_preference", e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">Tuition waiver acceptable</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-slate-700 p-2 border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.research_preference}
                  onChange={(e) => updateField("research_preference", e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">Research / Thesis track preference</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 6: Intake */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Target Intake Semester
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select your intended start period
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028"].map((intake) => {
                  const selected = formData.preferred_intake === intake;
                  return (
                    <button
                      type="button"
                      key={intake}
                      onClick={() => updateField("preferred_intake", intake)}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                        selected
                          ? "border-teal-700 bg-teal-50 text-teal-900"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {intake}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-start text-xs text-teal-900">
              <FiCheckCircle className="w-4 h-4 text-teal-700 mr-2 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ready to discover matched opportunities!</p>
                <p className="text-teal-800 mt-0.5">
                  Submitting will create your personalized dashboard and trigger live eligibility matching across all verified programs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Stepper Navigation Controls */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <FiArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="inline-flex items-center px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            {saving ? (
              "Saving..."
            ) : currentStep === STEPS.length ? (
              <>
                Complete Profile & Discover
                <FiCheckCircle className="w-3.5 h-3.5 ml-1.5" />
              </>
            ) : (
              <>
                Continue
                <FiArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
