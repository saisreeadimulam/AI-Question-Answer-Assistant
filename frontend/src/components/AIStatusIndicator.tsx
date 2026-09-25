"use client";

import { motion } from "framer-motion";
import { Loader2, Search, Brain, PenTool, Sparkles } from "lucide-react";

export type AIState = "idle" | "searching" | "analyzing" | "generating";

interface AIStatusIndicatorProps {
  state: AIState;
}

export function AIStatusIndicator({ state }: AIStatusIndicatorProps) {
  if (state === "idle") return null;

  const states = {
    searching: {
      text: "Searching Vector Database...",
      icon: Search,
      color: "from-orange-600 to-amber-700",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.4)]",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    analyzing: {
      text: "Analyzing Document Context...",
      icon: Brain,
      color: "from-amber-600 to-orange-600",
      glow: "shadow-[0_0_20px_rgba(234,88,12,0.4)]",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    generating: {
      text: "Generating Response & Citations...",
      icon: PenTool,
      color: "from-orange-500 to-amber-600",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.4)]",
      textColor: "text-orange-600 dark:text-orange-300",
    },
  };

  const currentState = states[state];
  const Icon = currentState.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-center space-x-3.5 px-4 py-3 glass-card rounded-2xl border border-orange-500/30 shadow-2xl"
    >
      <div className={`p-2 rounded-xl bg-gradient-to-r ${currentState.color} text-white ${currentState.glow}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      </div>

      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${currentState.textColor}`} />
        <span className={`text-xs sm:text-sm font-semibold tracking-wide animate-pulse ${currentState.textColor}`}>
          {currentState.text}
        </span>
      </div>

      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-orange-400" />
      </motion.div>
    </motion.div>
  );
}
