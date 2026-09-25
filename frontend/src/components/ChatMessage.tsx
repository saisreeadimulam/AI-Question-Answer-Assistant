"use client";

import React, { useState } from "react";
import { Copy, Check, Pencil } from "lucide-react";
import { ResponseCard } from "./ResponseCard";

export interface MessageData {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string;
}

interface ChatMessageProps {
  message: MessageData;
  onCopy?: (id: string, text: string) => void;
  onDownload?: (content: string) => void;
  onEditUserMessage?: (text: string) => void;
}

export function ChatMessage({
  message,
  onCopy,
  onDownload,
  onEditUserMessage,
}: ChatMessageProps) {
  const [copiedUser, setCopiedUser] = useState<boolean>(false);

  if (message.role === "ai") {
    return (
      <div className="flex justify-start w-full">
        <ResponseCard
          id={message.id}
          content={message.content}
          timestamp={message.timestamp}
          onCopy={onCopy}
          onDownload={onDownload}
        />
      </div>
    );
  }

  const handleCopyUser = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedUser(true);
    if (onCopy) onCopy(message.id, message.content);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  return (
    <div className="flex justify-end w-full">
      <div className="relative group max-w-[88%] sm:max-w-[82%] bg-gradient-to-r from-[#EA580C] via-amber-600 to-[#F97316] text-[#FFFFFF] shadow-md rounded-3xl rounded-tr-sm p-5 border border-orange-400/30">
        <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-medium text-[#FFFFFF]">
          {message.content}
        </p>

        <div className="absolute -bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-all z-10 flex items-center space-x-1 bg-white/90 backdrop-blur-md rounded-full px-2.5 py-1 border border-orange-200 shadow-sm">
          <button
            onClick={handleCopyUser}
            title="Copy message"
            className="p-1 text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            {copiedUser ? <Check className="w-3 h-3 text-orange-600" /> : <Copy className="w-3 h-3" />}
          </button>

          {onEditUserMessage && (
            <button
              onClick={() => onEditUserMessage(message.content)}
              title="Edit & Resend message"
              className="p-1 text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
