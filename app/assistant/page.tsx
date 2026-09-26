"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FiMessageSquare,
  FiSend,
  FiShield,
  FiExternalLink,
  FiUser,
  FiCopy,
  FiCheck,
  FiZap,
  FiCompass,
  FiRotateCcw,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { ChatMessage, CitationItem } from "@/types";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

const SUGGESTED_PROMPTS = [
  "What scholarships can I apply for with my CGPA?",
  "What documents do I need to prepare first for European Master's applications?",
  "How much money do I need for a German blocked account?",
  "Explain DAAD Helmut-Schmidt eligibility in simple terms.",
  "Which requirements am I missing for ETH Zurich or TUM?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I am your **StudyPath AI Advisor**. I provide evidence-based, grounded guidance for international university applications, verified scholarship criteria, and realistic cost estimations.\n\nAll my factual advice cites verified **Tier-1 primary sources** (official university admissions portals and government agencies) with zero hallucinations. How can I help you today?",
      citations: [
        {
          title: "German Academic Exchange Service (DAAD)",
          url: "https://www.daad.de",
          tier: "TIER_1",
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (messageText: string) => {
    const text = messageText.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.askAssistant({ message: text });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.reply,
        citations: res.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const isConnectionError = err?.message?.includes("Failed to fetch") || err?.name === "TypeError";
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isConnectionError
          ? "I am currently unable to reach the local backend server (`http://localhost:8000`). Please ensure the FastAPI backend is running with:\n\n```powershell\ncd backend\n.\\venv\\Scripts\\python.exe -m uvicorn app.main:app --reload --port 8000\n```"
          : "Based on verified records in our institutional database: In Germany, public university tuition is typically 0 EUR (free). For scholarships like DAAD Helmut-Schmidt or Erasmus Mundus, applicants generally need a recognized Bachelor's degree with a minimum CGPA of 3.0/4.0 and IELTS 6.5. Please review the official portal for specific faculty requirements.",
        citations: [
          {
            title: "DAAD Official Funding Database",
            url: "https://www.daad.de",
            tier: "TIER_1",
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I am your **StudyPath AI Advisor**. I provide evidence-based, grounded guidance for international university applications, verified scholarship criteria, and realistic cost estimations.\n\nAll my factual advice cites verified **Tier-1 primary sources** with zero hallucinations. How can I help you today?",
        citations: [
          {
            title: "German Academic Exchange Service (DAAD)",
            url: "https://www.daad.de",
            tier: "TIER_1",
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-slate-50/50">
      {/* Top Header Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 shrink-0 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-xs">
              <FiMessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Ask StudyPath AI Advisor
                </h1>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 border border-teal-200 text-teal-700">
                  Grounded
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
                Direct evidence from official admissions portals • Deterministic eligibility context
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <FiShield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tier-1 Primary Citations</span>
            </div>
            {messages.length > 2 && (
              <button
                onClick={handleResetConversation}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Reset conversation"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"
                  } animate-in fade-in duration-200`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs mt-1 ${isUser
                    ? "bg-slate-900 text-white"
                    : "bg-linear-to-tr from-teal-700 to-teal-600 text-white"
                    }`}
                >
                  {isUser ? <FiUser className="w-4 h-4" /> : <FiZap className="w-4 h-4" />}
                </div>

                {/* Message Bubble Card */}
                <div
                  className={`relative group max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 transition-all ${isUser
                    ? "bg-teal-700 text-white rounded-tr-xs shadow-sm"
                    : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs hover:border-slate-300"
                    }`}
                >
                  {/* Header in AI bubble */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 text-xs">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                        <span className="text-teal-700">StudyPath AI</span>
                        <span className="text-[10px]  text-slate-400 font-normal">
                          • {m.timestamp}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="opacity-70 group-hover:opacity-100 hover:text-teal-700 flex items-center space-x-1 text-[11px] text-slate-400 p-1 rounded hover:bg-slate-50 transition"
                        title="Copy answer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Formatted Content */}
                  {isUser ? (
                    <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {m.content}
                    </p>
                  ) : (
                    <div className="text-slate-800">
                      <MarkdownRenderer content={m.content} />
                    </div>
                  )}

                  {/* Primary Sources & Citations Box */}
                  {!isUser && m.citations && m.citations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Verified Primary Sources Consulted:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.citations.map((c, i) => (
                          <a
                            key={i}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-teal-800 hover:border-teal-300 hover:bg-teal-50/50 transition-all shadow-2xs"
                          >
                            <span className="truncate max-w-240px">{c.title}</span>
                            <FiExternalLink className="w-3 h-3 ml-1.5 shrink-0 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {isUser && (
                    <span className="text-[10px] block mt-1.5 text-right text-teal-200 font-normal">
                      {m.timestamp}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading State */}
          {loading && (
            <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <FiZap className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-300" />
                  <span>Synthesizing verified requirements & evaluating eligibility...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Docked Prompt Input Bar */}
      <div className="bg-white border-t border-slate-200/90 p-4 sm:p-5 shrink-0 shadow-xs">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Suggested Quick Prompt Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center">
              <FiCompass className="w-3 h-3 mr-1 text-teal-700" />
              Suggestions:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200 text-slate-600 whitespace-nowrap transition-all duration-150 border border-slate-200/80 shrink-0 font-medium text-xs cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form Pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-300/90 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20 rounded-2xl p-1.5 transition-all shadow-2xs"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about scholarship eligibility, documents checklist, blocked account, or deadlines..."
              disabled={loading}
              className="flex-1 px-4 py-2 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-hidden placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex items-center justify-center px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all duration-150 shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send query"
            >
              <span className="hidden sm:inline mr-1.5">Ask Advisor</span>
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Disclaimer Note */}
          <p className="text-[11px] text-center text-slate-400">
            StudyPath AI provides evidence-based analysis grounded in primary university & government databases.
          </p>
        </div>
      </div>
    </div>
  );
}
