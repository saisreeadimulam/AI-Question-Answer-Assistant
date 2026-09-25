"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Presentation,
  Image as ImageIcon,
  FileCode,
  Table,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Database,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Loader2,
  FileCheck2,
  X,
  FolderOpen,
} from "lucide-react";

interface PDFUploaderProps {
  onFileSelect?: (file: File | null) => void;
  onFilesSelect?: (files: File[]) => void;
  ingestedInfo?: { numChunks: number; filenames?: string[]; filename?: string } | null;
  isIngesting?: boolean;
}

export function PDFUploader({
  onFileSelect,
  onFilesSelect,
  ingestedInfo,
  isIngesting = false,
}: PDFUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState<boolean>(true);

  const notifyParent = (files: File[]) => {
    if (onFilesSelect) {
      onFilesSelect(files);
    }
    if (onFileSelect) {
      onFileSelect(files.length > 0 ? files[0] : null);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        setError("Some files were rejected. Please upload supported formats (PDF, DOCX, PPTX, XLSX, CSV, Images, TXT) under 50MB.");
      } else {
        setError(null);
      }

      if (acceptedFiles.length > 0) {
        // Filter out oversized files
        const validFiles = acceptedFiles.filter((file) => file.size <= 50 * 1024 * 1024);
        if (validFiles.length < acceptedFiles.length) {
          setError("Some files exceeded the 50MB size limit and were skipped.");
        }

        if (validFiles.length > 0) {
          setSelectedFiles((prev) => {
            // Deduplicate by name and size
            const existingKeys = new Set(prev.map((f) => `${f.name}_${f.size}`));
            const newFiles = validFiles.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));
            const updated = [...prev, ...newFiles];
            // Defer notifyParent to avoid setState during render conflict
            setTimeout(() => notifyParent(updated), 0);
            return updated;
          });
        }
      }
    },
    [onFilesSelect, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "text/plain": [".txt", ".md"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setTimeout(() => notifyParent(updated), 0);
      return updated;
    });
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setError(null);
    notifyParent([]);
  };

  const getFormatIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return <FileSpreadsheet className="w-4 h-4 text-[#F59E0B]" />;
    if (lower.endsWith(".pdf")) return <FileText className="w-4 h-4 text-[#38BDF8]" />;
    if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return <Presentation className="w-4 h-4 text-[#F59E0B]" />;
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp"))
      return <ImageIcon className="w-4 h-4 text-[#38BDF8]" />;
    if (lower.endsWith(".csv")) return <Table className="w-4 h-4 text-[#F59E0B]" />;
    if (lower.endsWith(".txt") || lower.endsWith(".docx") || lower.endsWith(".doc"))
      return <FileCode className="w-4 h-4 text-[#38BDF8]" />;
    return <FileText className="w-4 h-4 text-[#38BDF8]" />;
  };

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4 overflow-y-auto no-scrollbar bg-[#0A0D14]">
      {/* Drop Zone Box */}
      <div
        {...getRootProps()}
        className={`relative overflow-hidden w-full p-5 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
          isDragActive
            ? "border-[#38BDF8] bg-[#0F172A] shadow-[0_0_30px_rgba(56,189,248,0.25)] scale-[1.01]"
            : error
            ? "border-rose-500/80 bg-rose-950/20"
            : "border-white/10 hover:border-[#38BDF8]/60 bg-[#0F172A]/70 hover:bg-[#1E293B]/80 glass-panel"
        }`}
      >
        <input {...getInputProps()} />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#38BDF8]/10 rounded-full blur-2xl group-hover:bg-[#38BDF8]/25 transition-all duration-500 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-[#F59E0B]/10 rounded-full blur-2xl group-hover:bg-[#F59E0B]/20 transition-all duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {error ? (
            <>
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-rose-400 text-xs font-semibold">{error}</p>
              <p className="text-slate-400 text-[11px] mt-1">Click or drag additional files to retry</p>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#38BDF8]/20 via-[#0F172A] to-[#F59E0B]/20 border border-white/10 text-[#38BDF8] mb-2.5 group-hover:scale-110 group-hover:border-[#38BDF8]/50 transition-all duration-300 shadow-md">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-[#FFFFFF] text-sm tracking-wide group-hover:text-[#38BDF8] transition-colors">
                {isDragActive ? "Drop Files Here" : "Multi-File Batch Upload"}
              </h3>
              <p className="text-[#94A3B8] text-[11px] mt-1">Select or drop multiple files simultaneously</p>

              {/* Supported Format Badges Grid */}
              <div className="mt-4 grid grid-cols-3 gap-1.5 w-full max-w-xs">
                <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#FFFFFF]">
                  <FileText className="w-3 h-3 text-[#38BDF8] shrink-0" />
                  <span className="font-semibold">PDF</span>
                </div>

                <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#FFFFFF]">
                  <Presentation className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  <span className="font-semibold">PPTX</span>
                </div>

                <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#FFFFFF]">
                  <ImageIcon className="w-3 h-3 text-[#38BDF8] shrink-0" />
                  <span className="font-semibold">JPG/PNG</span>
                </div>

                <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#FFFFFF]">
                  <FileSpreadsheet className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  <span className="font-semibold">XLSX</span>
                </div>

                <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#FFFFFF]">
                  <FileCode className="w-3 h-3 text-[#38BDF8] shrink-0" />
                  <span className="font-semibold">DOCX</span>
                </div>

                <div className="flex items-center justify-center space-x-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#FFFFFF]">
                  <Table className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  <span className="font-semibold">CSV/TXT</span>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-[#94A3B8] px-2.5 py-0.5 rounded-full bg-[#0B0F19] border border-white/10">
                Resets vector memory on batch upload · Max 50MB/file
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Files Batch List Panel */}
      {selectedFiles.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full glass-card rounded-2xl border border-white/10 bg-[#0F172A] overflow-hidden"
          >
            {/* Header Bar with Batch Controls */}
            <div className="p-3 bg-[#1E293B]/70 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-bold text-[#FFFFFF]">
                  Active Batch ({selectedFiles.length})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
                  className="p-1 rounded-lg text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-white/10 transition-colors cursor-pointer"
                  title="Toggle file list"
                >
                  {isWidgetExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Clear All Files"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Ingestion Status Summary */}
            <div className="px-3 py-2 bg-[#0B0F19] border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {isIngesting ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#38BDF8] animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                )}
                <span className="text-[#94A3B8] text-[11px] font-medium">
                  {isIngesting ? "Embedding Documents..." : "Vector Store Active"}
                </span>
              </div>

              {ingestedInfo?.numChunks ? (
                <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#7DD3FC] text-[10px] font-bold">
                  {ingestedInfo.numChunks} Chunks
                </span>
              ) : isIngesting ? (
                <span className="text-[10px] text-[#F59E0B] font-semibold animate-pulse">Processing...</span>
              ) : null}
            </div>

            {/* Collapsible Active Documents List */}
            {isWidgetExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2 space-y-1.5 max-h-56 overflow-y-auto no-scrollbar"
              >
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}_${index}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#1E293B]/50 border border-white/5 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
                        {getFormatIcon(file.name)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-[#FFFFFF] truncate">{file.name}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title={`Remove ${file.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

