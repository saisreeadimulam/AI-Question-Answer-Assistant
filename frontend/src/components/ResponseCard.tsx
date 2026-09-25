"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Download,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreHorizontal,
  Mail,
  MessageSquare,
  Link,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ResponseCardProps {
  id: string;
  content: string;
  timestamp?: string;
  onCopy?: (id: string, text: string) => void;
  onDownload?: (content: string) => void;
}

export function ResponseCard({
  id,
  content,
  timestamp,
  onCopy,
  onDownload,
}: ResponseCardProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [disliked, setDisliked] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);

  const cleanText = content.replace(/\[RENDER_DOWNLOAD_BUTTON\]/g, "").trim();

  const handleLocalCopy = () => {
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    if (onCopy) onCopy(id, content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Q&A System Response",
          text: cleanText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to custom menu
      }
    }
    setShareOpen(!shareOpen);
  };

  const handleShareCopyText = () => {
    navigator.clipboard.writeText(cleanText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
    setShareOpen(false);
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(cleanText)}`;
    window.open(url, "_blank");
    setShareOpen(false);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("AI Q&A System Response");
    const body = encodeURIComponent(cleanText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
    setShareOpen(false);
  };

  const handleLocalDownload = () => {
    if (onDownload) {
      onDownload(content);
    } else {
      try {
        const blob = new Blob([cleanText], { type: "text/markdown;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const linkElem = document.createElement("a");
        linkElem.href = url;
        linkElem.download = "AI-QA-System-Response.md";
        document.body.appendChild(linkElem);
        linkElem.click();
        document.body.removeChild(linkElem);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative group max-w-[92%] sm:max-w-[88%] bg-[#0F172A] border border-white/10 rounded-3xl rounded-tl-sm p-6 text-[#FFFFFF] flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-[#38BDF8]/40 hover:shadow-cyan-950/30"
    >
      {/* High Contrast Dark Mode Markdown Body */}
      <MarkdownRenderer content={content} onDownload={handleLocalDownload} />

      {/* Card Footer & Toolbar */}
      {content.trim().length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#94A3B8]">
          <div className="flex items-center space-x-1.5">
            {/* Thumbs Up */}
            <button
              onClick={() => {
                setLiked(!liked);
                setDisliked(false);
              }}
              title="Helpful Response"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                liked
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40"
                  : "bg-[#1E293B] border-white/10 text-slate-300 hover:text-[#38BDF8] hover:border-[#38BDF8]/30"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            {/* Thumbs Down */}
            <button
              onClick={() => {
                setDisliked(!disliked);
                setLiked(false);
              }}
              title="Unhelpful Response"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                disliked
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-[#1E293B] border-white/10 text-slate-300 hover:text-rose-400 hover:border-rose-500/30"
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>

            {/* Share Dropdown */}
            <div className="relative">
              <button
                onClick={handleShareClick}
                title="Share Response"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  shareOpen
                    ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40"
                    : "bg-[#1E293B] border-white/10 text-slate-300 hover:text-[#38BDF8] hover:border-[#38BDF8]/30"
                }`}
              >
                {shareCopied ? (
                  <Check className="w-3.5 h-3.5 text-[#38BDF8]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>

              {shareOpen && (
                <div className="absolute left-0 bottom-10 w-52 bg-[#0F172A] border border-white/15 rounded-2xl p-2 z-40 space-y-1 shadow-2xl">
                  <p className="px-3 pt-1 pb-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                    Share via
                  </p>

                  <button
                    onClick={handleShareCopyText}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] rounded-xl transition-colors flex items-center space-x-2.5"
                  >
                    <Link className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Copy Clean Text</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] rounded-xl transition-colors flex items-center space-x-2.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] rounded-xl transition-colors flex items-center space-x-2.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Email</span>
                  </button>
                </div>
              )}
            </div>

            {/* Copy Raw */}
            <button
              onClick={handleLocalCopy}
              title="Copy Response"
              className="p-2 rounded-xl border bg-[#1E293B] border-white/10 text-slate-300 hover:text-[#FFFFFF] hover:border-[#38BDF8]/30 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#38BDF8]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Download Markdown */}
            <button
              onClick={handleLocalDownload}
              title="Download (.md)"
              className="p-2 rounded-xl border bg-[#1E293B] border-white/10 text-slate-300 hover:text-[#38BDF8] hover:border-[#38BDF8]/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {timestamp && <span className="text-[11px] text-[#94A3B8] font-medium">{timestamp}</span>}

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                title="More Options"
                className="p-2 rounded-xl border bg-[#1E293B] border-white/10 text-slate-300 hover:text-[#FFFFFF] transition-all cursor-pointer"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {moreOpen && (
                <div className="absolute right-0 bottom-10 w-48 bg-[#0F172A] border border-white/15 rounded-2xl p-2 z-30 space-y-1 shadow-2xl">
                  <button
                    onClick={() => {
                      handleLocalCopy();
                      setMoreOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Copy Raw Content</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLocalDownload();
                      setMoreOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#1E293B] rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Save as Markdown</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
