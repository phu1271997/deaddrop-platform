"use client";

import React from 'react';
import { LeakRecord } from '@/store/useStore';
import { formatTimestamp, truncateAddress } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, Calendar, Eye, Activity, Award } from 'lucide-react';
import Link from 'next/link';

interface LeakCardProps {
  leak: LeakRecord;
}

export default function LeakCard({ leak }: LeakCardProps) {
  // Determine styling based on verification status
  const isVerified = leak.status === 'VERIFIED';
  
  // Status colors
  const statusColor = isVerified 
    ? 'text-success border-success/30 bg-success/5 shadow-emerald-glow/5' 
    : 'text-primary border-primary/30 bg-primary/5 shadow-red-glow/5';

  const statusLabel = isVerified ? 'VERIFIED' : 'REJECTED';

  // Category symbols / labels
  const categoryLabels: Record<string, string> = {
    corporate_fraud: "Corporate Fraud",
    government: "Government Misconduct",
    environmental: "Environmental Crimes",
    healthcare: "Healthcare Abuses",
    tech: "Tech & Privacy",
    finance: "Financial Corruption",
    other: "Classified Leak"
  };

  return (
    <div className={`flex flex-col bg-background-card border border-background-border hover:border-zinc-800 rounded-lg p-5 transition-all duration-300 hover:-translate-y-0.5 shadow-md flex-1`}>
      {/* Category & Status Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 font-mono text-[10px]">
        <span className="px-2 py-0.5 rounded border border-background-border text-zinc-500 uppercase tracking-widest font-semibold bg-background-elevated">
          {categoryLabels[leak.category] || leak.category}
        </span>
        <span className={`px-2 py-0.5 rounded border font-bold uppercase tracking-widest flex items-center gap-1 ${statusColor}`}>
          {isVerified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
          {statusLabel}
        </span>
      </div>

      {/* Target Entity & Title */}
      <div className="mb-3 space-y-1">
        <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">TARGET ENTITY</span>
        <h4 className="text-sm font-bold text-zinc-300 font-mono flex items-center gap-1.5">
          {leak.target_entity}
          {isVerified && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />}
        </h4>
        <h3 className="text-base font-serif italic text-fafafa pt-1 tracking-wide leading-snug">
          {leak.title}
        </h3>
      </div>

      {/* Summary Snippet */}
      <p className="text-zinc-400 text-xs font-sans leading-relaxed mb-5 line-clamp-3 select-text">
        {leak.summary}
      </p>

      {/* Spacing spacer */}
      <div className="mt-auto" />

      {/* Score meters grid */}
      <div className="grid grid-cols-2 gap-3 border-t border-background-border pt-4 mb-4 font-mono text-[10px]">
        {/* Credibility */}
        <div className="flex items-center justify-between p-2 bg-background border border-background-border rounded">
          <span className="text-zinc-500 uppercase">Credibility</span>
          <span className={`font-bold ${isVerified ? 'text-success' : 'text-primary'}`}>
            {leak.credibility_score}%
          </span>
        </div>
        
        {/* Public Interest */}
        <div className="flex items-center justify-between p-2 bg-background border border-background-border rounded">
          <span className="text-zinc-500 uppercase">Impact</span>
          <span className="text-cyber font-bold">
            {leak.estimated_impact}
          </span>
        </div>
      </div>

      {/* Time & Action Button */}
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatTimestamp(leak.submission_timestamp).substring(0, 12)}</span>
        </div>

        <Link
          href={`/leaks/${leak.leak_id}`}
          className="flex items-center gap-1 text-cyber hover:text-white uppercase font-bold tracking-wider hover:underline transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          Audit Trail
        </Link>
      </div>
    </div>
  );
}
