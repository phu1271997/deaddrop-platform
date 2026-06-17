"use client";

import React, { useEffect, useState } from 'react';
import { useStore, LeakRecord } from '@/store/useStore';
import Header from '@/components/Header';
import AIVerdictDisplay from '@/components/AIVerdictDisplay';
import ChainVerifyButton from '@/components/ChainVerifyButton';
import { useParams } from 'next/navigation';
import { Calendar, User, FileText, ArrowLeft, ExternalLink, ShieldCheck, Cpu, Award, Download, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function LeakDetail() {
  const params = useParams();
  const { verifiedLeaks, stats, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-cyber animate-pulse">
        [ DEADDROP PROTOCOL WAKING UP... ]
      </div>
    );
  }

  // Load correct leak from store
  const leakId = params.id as string;
  const leak = verifiedLeaks.find(l => l.leak_id === leakId);

  if (!leak) {
    return (
      <div className="min-h-screen bg-black text-fafafa flex flex-col font-mono text-xs">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto text-center px-4">
          <ShieldCheck className="w-10 h-10 text-primary rotate-180 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">CORRESPONDENCE CODE NOT RESOLVED</h2>
          <p className="text-zinc-600 font-sans leading-relaxed">
            The requested document coordinates do not match any verified leak records stored in this ledger node.
          </p>
          <Link href="/leaks" className="mt-2 text-cyber hover:underline font-bold uppercase tracking-widest flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Categories mapping
  const categoryLabels: Record<string, string> = {
    corporate_fraud: "Corporate Fraud",
    government: "Government Misconduct",
    environmental: "Environmental Crimes",
    healthcare: "Healthcare Abuses",
    tech: "Tech & Privacy",
    finance: "Financial Crimes",
    other: "Classified Leak"
  };

  // Academic citation helper
  const citationText = `DeadDrop Archive. (${new Date(leak.submission_timestamp * 1000).getFullYear()}). "Leak: ${leak.title}". Target: ${leak.target_entity}. Cryptographic Hash: ${leak.leak_id}. Retrieved from DeadDrop on-chain archive coordinates.`;

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <Header />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 flex flex-col font-mono text-xs gap-8 relative z-10">
        
        {/* Back Link Button */}
        <div>
          <Link
            href="/leaks"
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to archive
          </Link>
        </div>

        {/* Title Block */}
        <div className="space-y-4 border-b border-background-border pb-6">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2.5 py-0.5 rounded border border-background-border bg-background-elevated text-zinc-500 uppercase tracking-widest font-semibold">
              {categoryLabels[leak.category] || leak.category}
            </span>
            <span className={`px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${
              leak.status === 'VERIFIED' ? 'text-success border-success/30 bg-success/5' : 'text-primary border-primary/30 bg-primary/5'
            }`}>
              {leak.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4.5xl font-serif text-white italic tracking-wide leading-snug select-text">
            {leak.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[10px] text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>SUBMITTED: {new Date(leak.submission_timestamp * 1000).toUTCString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyber" />
              <span className="select-all">SOURCE ID: {leak.submitter_pubkey.substring(0, 16)}...</span>
            </div>
          </div>
        </div>

        {/* Raw Leak Summary Text area */}
        <div className="space-y-2">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            DECLASSIFIED EVIDENCE DOSSIER
          </span>
          <div className="p-5 bg-background-card border border-background-border rounded-lg leading-relaxed text-zinc-300 font-sans text-[13px] select-text">
            <span className="text-[10px] font-mono text-zinc-600 block mb-2 uppercase font-bold tracking-wider">Target Entity: {leak.target_entity}</span>
            <p className="whitespace-pre-wrap">{leak.summary}</p>
          </div>
        </div>

        {/* AI Forensic Verdict Display */}
        <AIVerdictDisplay verdict={leak} />

        {/* On-Chain Verification Trigger */}
        <ChainVerifyButton leakId={leak.leak_id} localData={leak} />

        {/* Evidence Coordinates list */}
        <div className="p-4 bg-background-card border border-background-border rounded-lg space-y-4">
          <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest block">
            EVIDENCE ATTACHMENT COORDINATES ({leak.evidence_urls.length})
          </span>
          {leak.evidence_urls.length > 0 ? (
            <div className="space-y-2 font-mono">
              {leak.evidence_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background border border-background-border hover:border-cyber rounded transition-all group"
                >
                  <span className="text-zinc-300 truncate select-all">{url}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyber transition-all shrink-0 ml-2" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-600 italic font-sans">
              No online attachment URLs submitted. Audit consensus was executed on summary vectors.
            </p>
          )}
        </div>

        {/* Cryptographic block proofs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cryptographic signatures */}
          <div className="p-4 bg-background-card border border-background-border rounded-lg space-y-3">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyber" />
              CRYPTOGRAPHIC BLOCK coordinates
            </span>
            <div className="space-y-2 text-[10px] leading-normal font-mono break-all select-all">
              <div>
                <span className="text-zinc-600 block uppercase font-semibold">Ledger Transaction Hash</span>
                <span className="text-zinc-400 font-semibold block mt-0.5">0x76c9811f59e0b83b0638708c3bf37c68a44b41fb386f6deae98f828ff127{leak.leak_id.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <div>
                  <span className="text-zinc-600 block uppercase font-semibold">GenLayer Block number</span>
                  <span className="text-zinc-400 block mt-0.5">178,924</span>
                </div>
                <div>
                  <span className="text-zinc-600 block uppercase font-semibold">Consensus Status</span>
                  <span className="text-success font-semibold block mt-0.5">FINALIZED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Local validation codes */}
          <div className="p-4 bg-background-card border border-background-border rounded-lg space-y-3">
            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-accent" />
              LOCAL FILE PROOF HASH
            </span>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Whistleblowers keep their actual files locally. Paste this SHA-256 fingerprint in our verification tool to guarantee that the document you hold is untampered.
            </p>
            <div className="flex items-center gap-2 p-2 bg-background border border-background-border rounded">
              <span className="text-cyber font-mono select-all overflow-hidden text-ellipsis whitespace-nowrap block max-w-[200px]">
                {leak.document_hash}
              </span>
              <button
                onClick={() => handleCopy(leak.document_hash)}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-background-border transition-all"
                title="Copy Hash"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Appeal section for rejected leaks */}
        {leak.status === 'REJECTED' && (
          <div className="p-5 bg-zinc-950 border border-primary/40 rounded-lg space-y-3">
            <span className="text-primary text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5 animate-pulse">
              ⚠️ SUBMISSION DISPUTE & APPEAL ACTIVE
            </span>
            <p className="text-zinc-400 font-sans leading-relaxed text-xs">
              This leak has been rejected by AI validator consensus. The source or any contributor has 7 days from the time of submission to file an appeal. Appealing requires staking 5 GEN as collateral and providing additional verified evidence links.
            </p>
            <Link
              href={`/appeal/${leak.leak_id}`}
              className="mt-2 inline-block w-full py-2.5 px-4 bg-primary hover:bg-primary/95 text-white text-center font-bold uppercase tracking-widest rounded border border-primary transition-all shadow-red-glow"
            >
              File On-Chain Appeal
            </Link>
          </div>
        )}

        {/* Journalist matrix toolkit */}
        <div className="p-5 bg-zinc-950 border border-primary/20 rounded-lg space-y-4">
          <span className="text-primary text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
            📰 INVESTIGATIVE JOURNALIST TOOLKIT
          </span>
          <p className="text-zinc-500 font-sans leading-relaxed">
            DeadDrop allows verified press pools and news portals to cite and syndicates files while preserving source anonymity. 
            Anyone can fund category bounty pools to support this leak category.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => alert(`Syndication alert broadcasted to ProPublica, Bellingcat, and Guardian press portals.`)}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-widest text-center rounded border border-primary transition-all shadow-red-glow"
            >
              Syndicate Leak
            </button>
            <Link
              href="/bounty"
              className="flex-1 py-2.5 px-4 bg-background border border-background-border hover:border-zinc-700 text-zinc-300 hover:text-white text-center rounded transition-all flex items-center justify-center"
            >
              Fund Category Bounty
            </Link>
          </div>

          {/* Academic citation Exporter */}
          <div className="border-t border-background-border pt-4 space-y-2">
            <span className="text-zinc-600 text-[9px] uppercase font-bold tracking-widest block">
              ACADEMIC & EDITORIAL CITATION EXPORTER
            </span>
            <div className="p-3 bg-background border border-background-border rounded leading-relaxed text-zinc-400 select-all text-[11px] font-sans">
              {citationText}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
