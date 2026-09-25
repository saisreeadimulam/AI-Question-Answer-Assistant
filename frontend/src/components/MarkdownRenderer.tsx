"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Download, Sparkles, BookOpen } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onDownload?: (rawContent: string) => void;
}

export function MarkdownRenderer({ content, onDownload }: MarkdownRendererProps) {
  const components = {
    p: ({ children, ...props }: any) => {
      const text = String(children);
      if (text.includes("[RENDER_DOWNLOAD_BUTTON]")) {
        return (
          <button
            onClick={() => onDownload?.(content)}
            type="button"
            className="mt-4 flex items-center space-x-2.5 bg-gradient-to-r from-[#38BDF8] via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer font-semibold text-sm glow-cyan"
          >
            <Download className="w-4 h-4" />
            <span>Download Assessment (.md)</span>
          </button>
        );
      }
      return (
        <p className="mb-4 text-[#FFFFFF] leading-relaxed font-normal text-sm sm:text-base" {...props}>
          {children}
        </p>
      );
    },
    strong: ({ children }: any) => (
      <strong className="font-bold text-[#F59E0B]">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-[#CBD5E1]">{children}</em>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-xl sm:text-2xl font-bold text-[#38BDF8] mb-4 mt-6 border-b border-white/10 pb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#F59E0B] shrink-0" />
        <span>{children}</span>
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg sm:text-xl font-bold text-[#38BDF8] mb-3 mt-5">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-semibold text-[#38BDF8] mb-2 mt-4">{children}</h3>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-5 mb-4 text-[#FFFFFF] space-y-1.5">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-5 mb-4 text-[#FFFFFF] space-y-1.5">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-[#FFFFFF] font-normal leading-relaxed">{children}</li>
    ),
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="px-2 py-0.5 rounded-md bg-[#1E293B] border border-white/15 text-[#FFFFFF] text-xs font-mono font-semibold">
            {children}
          </code>
        );
      }
      return (
        <code className="block p-4 rounded-xl bg-[#0F172A] border border-white/10 text-[#FFFFFF] text-xs font-mono overflow-x-auto my-3 shadow-inner">
          {children}
        </code>
      );
    },
    a: ({ href, children }: any) => {
      const contentStr = String(children);
      if (contentStr.startsWith("[Source:")) {
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-0.5 ml-1.5 text-xs font-bold text-[#7DD3FC] bg-[#38BDF8]/15 border border-[#38BDF8]/30 rounded-full cursor-help hover:bg-[#38BDF8]/25 transition-all"
            title={`Verified Citation: ${contentStr}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
            {contentStr}
          </span>
        );
      }
      return (
        <a href={href} className="text-[#38BDF8] font-medium hover:underline transition-colors">
          {children}
        </a>
      );
    },
  };

  return (
    <div className="prose max-w-none prose-sm sm:prose-base text-[#FFFFFF] pr-2">
      <ReactMarkdown components={components} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
