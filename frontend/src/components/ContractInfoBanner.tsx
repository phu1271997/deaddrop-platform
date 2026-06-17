"use client";

import React, { useState } from 'react';
import { CONTRACT_ADDRESS } from '@/lib/genlayer-client';
import { ExternalLink, Copy, Check, Terminal, Cpu } from 'lucide-react';

export default function ContractInfoBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMock = CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000";

  return (
    <div className="w-full bg-zinc-950/90 border-b border-background-border backdrop-blur-md px-4 py-2 font-mono text-[10px] text-zinc-400 flex flex-col md:flex-row justify-between items-center gap-2 relative z-50">
      <div className="flex items-center gap-1.5 shrink-0">
        <Cpu className={`w-3.5 h-3.5 ${isMock ? 'text-primary' : 'text-cyber animate-pulse'}`} />
        <span className="font-bold uppercase tracking-wider">
          {isMock ? '[ OFFLINE DEV MODE ]' : '[ GENLAYER STUDIONET LIVE ]'}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 select-all font-mono">
        <span className="text-zinc-600 font-bold uppercase">Contract:</span>
        <code className={`px-1.5 py-0.5 rounded text-[10px] ${isMock ? 'text-primary bg-primary/10 border border-primary/20' : 'text-cyber bg-cyber/10 border border-cyber/20'}`}>
          {CONTRACT_ADDRESS}
        </code>
        <button
          onClick={handleCopy}
          className="p-1 text-zinc-500 hover:text-white hover:bg-background-border rounded transition-all cursor-pointer"
          title="Copy Contract Address"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <a
          href={`https://studio.genlayer.com/?import-contract=${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-white transition-all text-zinc-500 font-semibold"
        >
          Open in Studio
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
        <span className="text-zinc-700">|</span>
        <a
          href={`https://genlayer-explorer.com/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-white transition-all text-zinc-500 font-semibold"
        >
          View Explorer
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
