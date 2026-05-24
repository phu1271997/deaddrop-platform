"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Sparkles, BookOpen, Compass, Award } from 'lucide-react';
import CredibilityBadge from './CredibilityBadge';

interface AIVerdictDisplayProps {
  verdict: {
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    credibility_score: number;
    public_interest_score: number;
    ai_reasoning: string;
    red_flags: string[];
    recommended_followup: string;
    estimated_impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    submission_timestamp?: number;
  };
}

export default function AIVerdictDisplay({ verdict }: AIVerdictDisplayProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="w-full bg-background-card border border-background-border rounded-lg overflow-hidden font-mono text-xs shadow-cyber-glow">
      {/* Header section */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 border-b border-background-border cursor-pointer hover:bg-background/40 select-none"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyber animate-pulse-slow" />
          <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold">
            AI GATEKEEPER FORENSIC AUDIT RECORD
          </h3>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 hover:text-white">
          <span className="text-[10px]">{expanded ? "HIDE AUDIT" : "EXPAND AUDIT"}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="p-5 space-y-6">
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-4 bg-background border border-background-border rounded-lg">
            {/* Credibility ring */}
            <div className="flex justify-center border-b sm:border-b-0 sm:border-r border-background-border pb-4 sm:pb-0 sm:pr-4">
              <CredibilityBadge 
                score={verdict.credibility_score} 
                verdict={verdict.status} 
                size="lg" 
              />
            </div>

            {/* Public interest ring */}
            <div className="flex justify-center border-b sm:border-b-0 sm:border-r border-background-border pb-4 sm:pb-0 sm:pr-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative rounded-full flex items-center justify-center bg-black/40 border border-background-border p-1.5 w-[122px] h-[122px] shadow-cyber-glow">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-bold text-2xl text-fafafa">{verdict.public_interest_score}%</span>
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">PUBLIC INTEREST</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyber flex items-center gap-1 mt-1">
                  <Compass className="w-3.5 h-3.5" />
                  EVALUATED
                </span>
              </div>
            </div>

            {/* Platform Impact */}
            <div className="flex flex-col items-center justify-center text-center gap-1.5 py-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">ESTIMATED IMPACT LEVEL</span>
              <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded border ${
                verdict.estimated_impact === 'CRITICAL' 
                  ? 'bg-primary/20 text-primary border-primary/40 shadow-red-glow' 
                  : verdict.estimated_impact === 'HIGH'
                  ? 'bg-accent/20 text-accent border-accent/40 shadow-amber-glow'
                  : 'bg-background-elevated text-zinc-400 border-background-border'
              }`}>
                {verdict.estimated_impact}
              </span>
              <span className="text-[9px] text-zinc-600 mt-1 uppercase max-w-[150px] leading-tight">
                {verdict.estimated_impact === 'CRITICAL' || verdict.estimated_impact === 'HIGH'
                  ? "Requires immediate journalistic syndication"
                  : "Standard filing public archive status"}
              </span>
            </div>
          </div>

          {/* AI Reasoning Block */}
          <div className="space-y-2">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyber" />
              EDITORIAL REASONING & FINDINGS
            </span>
            <div className="p-4 bg-background border border-background-border rounded leading-relaxed text-zinc-300 select-text font-sans text-[13px] border-l-2 border-l-cyber">
              {verdict.ai_reasoning}
            </div>
          </div>

          {/* Forensic Red Flags Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-background-border rounded space-y-2">
              <span className="text-primary text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-primary" />
                FORENSIC RED FLAGS ({verdict.red_flags.length})
              </span>
              {verdict.red_flags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {verdict.red_flags.map((flag, index) => (
                    <span 
                      key={index}
                      className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] rounded flex items-center gap-1"
                    >
                      ⚠️ {flag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-600 font-sans italic py-2">
                  No critical forensic or fabrication red flags detected by the validator consensus.
                </p>
              )}
            </div>

            {/* Recommended Follow-up Actions for journalists */}
            <div className="p-4 bg-background border border-background-border rounded space-y-2">
              <span className="text-accent text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-accent" />
                RECOMMENDED JOURNALISTIC INVESTIGATION
              </span>
              <p className="text-zinc-400 leading-relaxed font-sans text-xs pt-1">
                {verdict.recommended_followup || "Monitor related SEC registries or news disclosures regarding this target entity."}
              </p>
            </div>
          </div>

          {/* Audit disclaimer & architecture link */}
          <div className="pt-2 text-[10px] text-zinc-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-background-border">
            <span>
              ⚖️ The AI Gatekeeper is an optimistic consensus protocol. Audit trail is un-alterable.
            </span>
            <a 
              href="#architecture" 
              className="text-cyber hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold text-[9px]"
            >
              <Award className="w-3 h-3" />
              How consensus handles audits
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
