"use client";

import React, { useEffect } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          An unexpected error occurred while retrieving opportunity data. Please try refreshing.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition"
        >
          <FiRefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
