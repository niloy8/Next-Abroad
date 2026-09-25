"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiCompass,
  FiAward,
  FiBookOpen,
  FiGlobe,
  FiCheckSquare,
  FiMessageSquare,
  FiMenu,
  FiX,
  FiUser,
  FiShield,
  FiLogOut,
  FiUploadCloud,
} from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Discover", href: "/discover", icon: FiCompass },
    { name: "Universities", href: "/universities", icon: FiBookOpen },
    { name: "Scholarships", href: "/scholarships", icon: FiAward },
    { name: "Countries", href: "/countries", icon: FiGlobe },
    { name: "My Plan", href: "/plan", icon: FiCheckSquare },
    { name: "Ask StudyPath", href: "/assistant", icon: FiMessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-800 transition-colors">
            <FiCompass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">NextAbroad</span>
            <span className="text-teal-600 font-semibold text-xs ml-1 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-teal-50 text-teal-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <Icon className={`w-4 h-4 mr-1.5 ${isActive ? "text-teal-700" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & User */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            href="/cv-upload"
            className="text-xs text-slate-600 hover:text-teal-700 font-medium inline-flex items-center py-1.5 px-2.5 rounded border border-slate-200 hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
            title="Upload CV to auto-extract profile"
          >
            <FiUploadCloud className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Upload CV
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center space-x-2 text-sm text-slate-700 hover:text-slate-900 py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-semibold">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <span className="font-medium text-xs max-w-100px truncate">{user.full_name}</span>
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 text-xs">
                    <p className="font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <FiUser className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    My Dashboard
                  </Link>
                  <Link
                    href="/onboarding"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <FiCheckSquare className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    Edit Profile
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <FiShield className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    Admin Ingestion
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                    }}
                    className="w-full text-left flex items-center px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    <FiLogOut className="w-3.5 h-3.5 mr-2 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 transition shadow-xs"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium ${isActive
                    ? "bg-teal-50 text-teal-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-teal-700" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2 text-sm text-slate-700"
            >
              <FiUser className="w-4 h-4 mr-2 text-slate-500" />
              Student Dashboard
            </Link>
            <Link
              href="/cv-upload"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2 text-sm text-slate-700"
            >
              <FiUploadCloud className="w-4 h-4 mr-2 text-slate-500" />
              Upload CV
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2 text-sm text-slate-700"
            >
              <FiShield className="w-4 h-4 mr-2 text-slate-500" />
              Admin Portal
            </Link>
            <Link
              href="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800"
            >
              Build My Study Plan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
