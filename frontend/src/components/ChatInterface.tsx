"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Square,
  Sparkles,
  BookOpen,
  Lightbulb,
  FileCheck,
  HelpCircle,
  Cpu,
} from "lucide-react";
import { AIStatusIndicator, AIState } from "./AIStatusIndicator";
import { ChatMessage, MessageData } from "./ChatMessage";

interface ChatInterfaceProps {
  messages: MessageData[];
  aiState: AIState;
  isGenerating?: boolean;
  hasFile?: boolean;
  ingestedInfo?: { numChunks: number; filenames?: string[] } | null;
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
}

const SUGGESTED_QUESTIONS = [
  { icon: Lightbulb, label: "Summarize All Files", prompt: "Please summarize all uploaded files into a clear, document-by-document summary." },
  { icon: BookOpen, label: "Compare Uploaded Documents", prompt: "Please compare all uploaded documents, highlighting key differences, metric comparisons, and insights in a Markdown table." },
  { icon: HelpCircle, label: "Key Takeaways", prompt: "What are the key takeaways, core findings, formulas, and data points across all uploaded assets?" },
  { icon: FileCheck, label: "Generate Practice Test", prompt: "Can you please generate a tiered question paper with Easy, Medium, and Hard questions based on these documents?" },
];

export function ChatInterface({
  messages,
  aiState,
  isGenerating = false,
  hasFile = false,
  ingestedInfo,
  onSendMessage,
  onStopGeneration,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);

  const isCurrentlyGenerating = isGenerating || aiState !== "idle";

  // Filter out system ingestion toast messages so ingestion banner stays pinned at top
  const chatMessages = messages.filter((m: any) => !m.isIngestionToast && !m.content?.startsWith("Ingesting **"));
  const ingestionToastMsg = messages.find((m: any) => m.isIngestionToast || m.content?.includes("Successfully ingested"));

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 80;
    }
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, aiState]);

  const handleEditUserMessage = (text: string) => {
    setInput(text);
    setTimeout(() => {
      inputRef.current?.focus();
      const len = text.length;
      inputRef.current?.setSelectionRange(len, len);
    }, 50);
  };

  const handleDownload = (rawContent: string) => {
    try {
      const cleanContent = rawContent.replace(/\[RENDER_DOWNLOAD_BUTTON\]/g, "").trim();
      const blob = new Blob([cleanContent], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AI-QA-System-Response.md";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      shouldAutoScrollRef.current = true;
      const userText = input.trim();
      setInput("");
      onSendMessage(userText);
    }
  };

  const handleChipClick = (prompt: string) => {
    if (prompt && prompt.trim()) {
      shouldAutoScrollRef.current = true;
      onSendMessage(prompt.trim());
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-[#FFFFFF] relative overflow-hidden">
      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10 no-scrollbar"
        id="chat-history-content"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="p-4 rounded-3xl bg-gradient-to-tr from-[#38BDF8]/20 via-sky-900/30 to-[#F59E0B]/20 border border-white/10 mb-6 shadow-xl glow-cyan">
              <Cpu className="w-10 h-10 text-[#38BDF8] animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#FFFFFF] mb-3 tracking-tight">
              Welcome to AI Q&amp;A System
            </h2>
            <p className="text-[#94A3B8] max-w-md text-sm sm:text-base mb-8 leading-relaxed">
              Multi-Format RAG &amp; Intelligence Suite. Upload single or multiple document assets to ask questions and extract instant insights.
            </p>

            {hasFile ? (
              <div className="w-full max-w-xl">
                <p className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Suggested Prompts for Uploaded Assets</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUESTIONS.map((chip, idx) => {
                    const ChipIcon = chip.icon;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChipClick(chip.prompt)}
                        className="flex items-center space-x-3.5 p-4 rounded-2xl glass-card text-left transition-all duration-300 cursor-pointer group bg-[#0F172A] border border-white/10 hover:border-[#38BDF8]/40"
                      >
                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#38BDF8] to-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
                          <ChipIcon className="w-4 h-4 text-sky-100" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#FFFFFF] group-hover:text-[#38BDF8] transition-colors">
                          {chip.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-2xl bg-[#0F172A] border border-white/10 text-xs text-[#94A3B8] max-w-sm">
                👈 Please drag &amp; drop or select files in the left sidebar to activate the AI Q&amp;A engine.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto w-full pb-36">
            {/* Top Pinned System Ingestion Header Notification Banner */}
            {hasFile && (ingestedInfo || ingestionToastMsg) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#0F172A] to-indigo-950/40 border border-[#38BDF8]/30 shadow-lg backdrop-blur-xl flex items-center justify-between text-xs sm:text-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] shrink-0">
                    <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#FFFFFF] flex items-center gap-2">
                      <span>🎉 Successfully Ingested {ingestedInfo?.filenames?.length || 1} Document(s)</span>
                    </h4>
                    <p className="text-[#94A3B8] text-xs mt-0.5">
                      {ingestedInfo?.filenames?.join(", ") || "Uploaded files"} — indexed into {ingestedInfo?.numChunks || "active"} vector chunks. You can now ask questions.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-semibold whitespace-nowrap shrink-0 hidden sm:inline-block">
                  Vector Memory Active
                </span>
              </motion.div>
            )}

            {/* Sequential Q&A Chat Messages Flowing Below System Banner */}
            {chatMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onDownload={handleDownload}
                onEditUserMessage={handleEditUserMessage}
              />
            ))}

            {/* Generating Response & Citations Indicator */}
            {aiState !== "idle" && (
              <div className="flex justify-start">
                <AIStatusIndicator state={aiState} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips Header */}
      {hasFile && messages.length > 0 && !isCurrentlyGenerating && (
        <div className="px-4 sm:px-6 max-w-4xl mx-auto w-full mb-3 relative z-20">
          <div className="flex items-center space-x-2.5 overflow-x-auto py-1 px-1 no-scrollbar">
            {SUGGESTED_QUESTIONS.map((chip, idx) => {
              const ChipIcon = chip.icon;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleChipClick(chip.prompt)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-full glass-card text-xs font-semibold text-[#FFFFFF] bg-[#0F172A] border border-white/10 hover:text-[#38BDF8] hover:border-[#38BDF8]/50 whitespace-nowrap transition-all duration-300 cursor-pointer group shadow-sm"
                >
                  <div className="p-1 rounded-full bg-[#38BDF8]/15 group-hover:bg-[#38BDF8] text-[#38BDF8] group-hover:text-[#0B0F19] transition-colors">
                    <ChipIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>{chip.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed Bottom Input Bar */}
      <div className="p-4 bg-[#0A0D14]/90 backdrop-blur-2xl border-t border-white/10 relative z-20">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative flex items-end glass-input rounded-2xl focus-within:border-[#38BDF8] transition-all overflow-hidden bg-[#1E293B] border border-white/15"
        >
          <button
            type="button"
            className="p-4 text-slate-400 hover:text-[#38BDF8] transition-colors"
            title="Attach extra files"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={hasFile ? "Ask a question about your uploaded documents..." : "Please upload documents to begin..."}
            disabled={!hasFile}
            className="flex-1 max-h-48 min-h-[56px] py-4 px-2 resize-none outline-none text-[#FFFFFF] bg-transparent text-sm sm:text-base placeholder:text-[#94A3B8] disabled:opacity-50 font-medium"
            rows={input.split("\n").length > 1 ? Math.min(input.split("\n").length, 5) : 1}
          />

          {isCurrentlyGenerating ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onStopGeneration?.();
              }}
              title="Stop generating"
              className="p-4 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Square className="w-5 h-5 fill-rose-400 text-rose-400" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || !hasFile}
              className="p-4 text-[#38BDF8] hover:text-[#7DD3FC] hover:bg-[#38BDF8]/10 transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

