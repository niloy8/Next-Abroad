import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "NextAbroad AI - Find the Right Path to Study Abroad",
  description:
    "Discover universities, scholarships, costs, eligibility requirements, and application steps based on your academic profile and goals.",
  keywords: [
    "study abroad",
    "scholarships",
    "international universities",
    "DAAD",
    "Erasmus Mundus",
    "fully funded scholarships",
    "admissions roadmap",
  ],
  authors: [{ name: "NextAbroad AI Team" }],
  openGraph: {
    title: "NextAbroad AI - Find the Right Path to Study Abroad",
    description:
      "Discover universities, scholarships, costs, eligibility requirements, and application steps based on your academic profile.",
    url: "https://nextabroad.ai",
    siteName: "NextAbroad AI",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
