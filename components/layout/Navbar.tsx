"use client";

import React, { useState, useEffect, useRef } from "react";
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
  FiChevronDown,
  FiZap,
} from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdown(false);
  }, [pathname]);

  const navLinks = [
    { name: "Discover", href: "/discover", icon: FiCompass },
    { name: "Universities", href: "/universities", icon: FiBookOpen },
    { name: "Scholarships", href: "/scholarships", icon: FiAward },
    { name: "Countries", href: "/countries", icon: FiGlobe },
    { name: "My Plan", href: "/plan", icon: FiCheckSquare },
    {
      name: "AI Advisor",
      href: "/assistant",
      icon: FiMessageSquare,
      badge: "AI",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-sm shadow-teal-900/20 group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
            <FiCompass className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight group-hover:text-teal-950 transition-colors">
              NextAbroad
            </span>
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-teal-500/10 text-teal-700 border border-teal-600/20">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative inline-flex items-center px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-teal-50 text-teal-900 font-semibold shadow-xs ring-1 ring-teal-600/15"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1.5 transition-colors ${
                    isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{link.name}</span>
                {link.badge && (
                  <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-600 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Action Area */}
        <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
          <Link
            href="/cv-upload"
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200/90 hover:bg-slate-100/90 hover:text-slate-900 hover:border-slate-300 transition-all duration-150 shadow-2xs whitespace-nowrap"
            title="Upload CV to auto-extract student profile"
          >
            <FiUploadCloud className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
            <span>Upload CV</span>
          </Link>

          {user ? (
            /* Logged In User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="inline-flex items-center space-x-2 py-1 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all duration-150 shadow-2xs group cursor-pointer"
                aria-expanded={userDropdown}
              >
                <div className="w-6 h-6 rounded-lg bg-linear-to-tr from-teal-700 to-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <span className="font-semibold text-xs max-w-[120px] truncate text-slate-700 group-hover:text-slate-900">
                  {user.full_name || "Account"}
                </span>
                <FiChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    userDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-semibold text-xs text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-teal-900 hover:bg-teal-50/60 transition-colors"
                    >
                      <FiUser className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                      Student Dashboard
                    </Link>
                    <Link
                      href="/plan"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-teal-900 hover:bg-teal-50/60 transition-colors"
                    >
                      <FiCheckSquare className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                      My Application Plan
                    </Link>
                    <Link
                      href="/onboarding"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-teal-900 hover:bg-teal-50/60 transition-colors"
                    >
                      <FiZap className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                      Edit Student Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-teal-900 hover:bg-teal-50/60 transition-colors"
                      >
                        <FiShield className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                        Admin Quality Audit
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdown(false);
                      }}
                      className="w-full text-left flex items-center px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
                    >
                      <FiLogOut className="w-3.5 h-3.5 mr-2.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out Actions */
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="text-xs xl:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100/70 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-white bg-linear-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 transition-all shadow-sm shadow-teal-900/15 hover:shadow-md whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center space-x-2">
          {user && (
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold"
              title="Dashboard"
            >
              {user.full_name?.charAt(0) || "U"}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-teal-700" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-600 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-1.5 mt-2">
            <Link
              href="/cv-upload"
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <FiUploadCloud className="w-4 h-4 mr-3 text-teal-600" />
              Upload CV / Resume
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <FiUser className="w-4 h-4 mr-3 text-teal-600" />
                  Student Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <FiShield className="w-4 h-4 mr-3 text-teal-600" />
                    Admin Quality Audit
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="w-full text-left flex items-center px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4 mr-3 text-rose-500" />
                  Sign Out ({user.full_name})
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  className="text-center px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-center px-3 py-2 rounded-lg text-sm font-semibold bg-teal-700 text-white hover:bg-teal-800"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
