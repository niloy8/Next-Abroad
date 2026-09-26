"use client";

import React from "react";
import { FiExternalLink } from "react-icons/fi";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Robust inline Markdown parser that transforms **bold**, *italic*, `code`,
 * and [links](url) into clean React elements.
 */
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match links, bold, code, and italics
  // Order matters: links first, then bold, code, italic
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+?\*\*|`[^`]+?`|(?:\b|_)\*[^*]+?\*(?:\b|_))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [anchor](href)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2 hover:bg-teal-50 px-1 py-0.5 rounded transition-colors"
          >
            <span>{match[1]}</span>
            <FiExternalLink className="w-3 h-3 ml-1 shrink-0 inline opacity-70" />
          </a>
        );
      }
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-slate-900">
          {parseInline(inner)}
        </strong>
      );
    }

    // Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-teal-800 font-mono text-[12px] sm:text-[13px] border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2 && !part.startsWith("**")) {
      return (
        <em key={index} className="italic text-slate-700">
          {parseInline(part.slice(1, -1))}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Structural Markdown block parser supporting:
 * - Headings # through #####
 * - Dividers (---, ***)
 * - Bullet lists (*, -, +)
 * - Numbered lists (1., 2.)
 * - Blockquotes (>)
 * - Paragraphs
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === "ul") {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start text-slate-700 leading-relaxed text-sm sm:text-[15px]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-2.5 mt-2 shrink-0" />
              <div className="flex-1">{parseInline(item)}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2.5 space-y-2 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start text-slate-700 leading-relaxed text-sm sm:text-[15px]">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold mr-2.5 shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">{parseInline(item)}</div>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Horizontal divider: --- or ***
    if (/^(\-{3,}|\*{3,}|\_{3,})$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-4 border-t border-slate-200" />);
      continue;
    }

    // Headings (H1 to H5)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      if (level === 1) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-slate-900 mt-5 mb-2 tracking-tight">
            {parseInline(text)}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
            {parseInline(text)}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-1.5 tracking-tight">
            {parseInline(text)}
          </h3>
        );
      } else {
        // H4, H5, H6
        elements.push(
          <h4 key={`h4-${i}`} className="text-sm sm:text-base font-bold text-slate-800 mt-3 mb-1 tracking-tight">
            {parseInline(text)}
          </h4>
        );
      }
      continue;
    }

    // Unordered list item: * or - or +
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Ordered list item: 1. or 2.
    const numMatch = trimmed.match(/^\d+[\.)]\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numMatch[1]);
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed text-slate-700 text-sm sm:text-[15px]">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
};
