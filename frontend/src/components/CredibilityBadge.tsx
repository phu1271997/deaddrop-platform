"use client";

import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface CredibilityBadgeProps {
  score: number;
  verdict: 'VERIFIED' | 'REJECTED' | 'PENDING';
  size?: 'sm' | 'md' | 'lg';
}

export default function CredibilityBadge({
  score,
  verdict,
  size = 'md'
}: CredibilityBadgeProps) {
  // Determine color theme based on score/verdict
  let themeColor = 'text-accent border-accent/30 bg-accent/5';
  let badgeIcon = <Shield className="w-4 h-4" />;
  let strokeColor = '#f59e0b'; // amber
  let glowStyle = 'shadow-amber-glow';

  if (verdict === 'VERIFIED') {
    themeColor = 'text-success border-success/30 bg-success/5';
    badgeIcon = <ShieldCheck className="w-4 h-4" />;
    strokeColor = '#10b981'; // emerald
    glowStyle = 'shadow-emerald-glow';
  } else if (verdict === 'REJECTED') {
    themeColor = 'text-primary border-primary/30 bg-primary/5';
    badgeIcon = <ShieldAlert className="w-4 h-4 text-primary" />;
    strokeColor = '#dc2626'; // red
    glowStyle = 'shadow-red-glow';
  }

  // Dimensions
  const dim = size === 'sm' ? 36 : size === 'md' ? 64 : 110;
  const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 4 : 6;
  const radius = (dim - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-wider uppercase font-semibold ${themeColor}`}>
        {badgeIcon}
        <span>{verdict} • {score}%</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Circle Meter Gauge */}
      <div 
        className={`relative rounded-full flex items-center justify-center bg-black/40 border border-background-border p-1.5 ${glowStyle} transition-all duration-500`}
        style={{ width: dim + 12, height: dim + 12 }}
      >
        <svg width={dim} height={dim} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="transparent"
            stroke="#1c1c1e"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Value Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className={`font-bold ${
            size === 'lg' ? 'text-2xl' : 'text-sm'
          } text-fafafa`}>
            {score}%
          </span>
          {size === 'lg' && (
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">Credibility</span>
          )}
        </div>
      </div>

      {/* Label under Circle */}
      <span className={`text-[10px] font-mono tracking-widest uppercase font-bold flex items-center gap-1 mt-1 ${
        verdict === 'VERIFIED' 
          ? 'text-success' 
          : verdict === 'REJECTED' 
          ? 'text-primary' 
          : 'text-accent'
      }`}>
        {badgeIcon}
        {verdict}
      </span>
    </div>
  );
}
