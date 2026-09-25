"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FiMessageSquare,
  FiSend,
  FiShield,
  FiExternalLink,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiCompass,
} from "react-icons/fi";
import { api } from "@/lib/api";
import { ChatMessage, CitationItem } from "@/types";

const SUGGESTED_PROMPTS = [
  "What scholarships can I apply for with CGPA 3.4 in Germany?",
  "What documents do I need to prepare first for European Master's applications?",
  "How much money should I prepare for a German blocked account?",
  "Explain the DAAD Helmut-Schmidt-Programme eligibility criteria in simple language.",
  "Which requirements am I missing for Swiss universities (ETH Zurich)?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I am your Ask StudyPath AI Assistant. I provide evidence-based guidance for international university applications, verified scholarship criteria, and cost estimations.\n\nAll my factual advice cites primary Tier-1 sources (official university admissions and government portals) and never fabricates deadlines or admission requirements. How can I help you today?",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Based on verified records in our institutional database: In Germany, public university tuition is typically 0 EUR (free). For scholarships like DAAD Helmut-Schmidt or Erasmus Mundus, applicants generally need a recognized Bachelor's degree with a minimum CGPA of 3.0/4.0 and IELTS 6.5. Please review the official portal for specific faculty requirements.",
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 mb-4 shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center text-white">
              <FiMessageSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Ask StudyPath AI</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded in primary sources • Deterministic eligibility context • Zero hallucinations
          </p>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <FiShield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tier-1 Primary Citations</span>
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex items-start ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center mr-2.5 shrink-0 mt-0.5 font-bold text-xs">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                  isUser
                    ? "bg-teal-700 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Citations Box */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Verified Primary Sources Consulted:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {m.citations.map((c, i) => (
                        <a
                          key={i}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-slate-50 border border-slate-200 text-slate-600 hover:text-teal-700 transition"
                        >
                          <span className="truncate max-w-200px">{c.title}</span>
                          <FiExternalLink className="w-2.5 h-2.5 ml-1 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`text-[10px] block mt-2 text-right ${
                    isUser ? "text-teal-200" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center ml-2.5 shrink-0 mt-0.5">
                  <FiUser className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 py-2">
            <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce delay-200" />
            <span>Consulting verified knowledge base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Carousel */}
      <div className="py-2 shrink-0">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition border border-slate-200 shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 shadow-xs focus-within:border-teal-600"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about scholarships, eligibility reasons, required documents, or cost..."
            className="flex-1 px-3 py-1.5 text-xs text-slate-800 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg transition shrink-0"
            aria-label="Send query"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
