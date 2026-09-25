import Link from "react";
import LinkNext from "next/link";
import { FiCompass, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4">
          <FiCompass className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The study opportunity, program, or destination page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <LinkNext
            href="/"
            className="inline-flex items-center px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition"
          >
            <FiArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Home
          </LinkNext>
        </div>
      </div>
    </div>
  );
}
