"use client";

import React, { useEffect, useState } from 'react';
import { useStore, LeakRecord } from '@/store/useStore';
import Header from '@/components/Header';
import { useParams, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, ExternalLink, HelpCircle, FileText, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function AppealPage() {
  const params = useParams();
  const router = useRouter();
  const { verifiedLeaks, appealRejection, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);
  const [evidenceInput, setEvidenceInput] = useState("");
  const [isAppealing, setIsAppealing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState(0); // 0: idle, 1: tx pending, 2: consensus evaluation, 3: done

  const leakId = params.id as string;
  // Look for the leak in verified leaks (which might also contain rejected ones if they were loaded)
  // Or we can find it from local state or just appeal anyway since the contract validates it.
  const [leak, setLeak] = useState<LeakRecord | null>(null);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  useEffect(() => {
    if (mounted && verifiedLeaks) {
      // Find leak in our local store
      const found = verifiedLeaks.find(l => l.leak_id === leakId);
      if (found) {
        setLeak(found);
      }
    }
  }, [mounted, verifiedLeaks, leakId]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[APPEAL] ${log}`]);
  };

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceInput.trim()) {
      alert("Please enter additional evidence URLs.");
      return;
    }

    const urls = evidenceInput
      .split(/[\n,]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    setIsAppealing(true);
    setLogs([]);
    setStep(1);
    addLog("STAGING COLLATERAL ACCOUNT CONSTRAINTS...");
    addLog("STAKING REQUIREMENT: 5.0000 GEN");
    await new Promise(r => setTimeout(r, 600));

    try {
      addLog("BROADCASTING appeal_rejection TO GENLAYER BLOCKCHAIN...");
      const res = await appealRejection(leakId, urls);
      if (res.success) {
        setStep(2);
        addLog("✓ STAKE ESCROW LOCKED ON-CHAIN.");
        addLog("✓ APPEAL TRANSACTION FINALIZED!");
        addLog("[AI GATEKEEPER] WAKING APPELLATE CONSENSUS COMMITTEE...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("[AI GATEKEEPER] INGESTING ORIGINAL SUBMISSION AND FORENSIC DISPUTE RED FLAGS...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("[AI GATEKEEPER] INGESTING NEW EVIDENCE ATTACHMENT CHUNKS...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("[AI GATEKEEPER] EXECUTING LLM COMPARATIVE DOUBLE-VERDICT PRINCIPLE...");
        await new Promise(r => setTimeout(r, 1500));
        addLog("[CONSENSUS] VALIDATORS BROADCASTING OVERTURN DECISIONS...");
        await new Promise(r => setTimeout(r, 1000));
        addLog("✓ APPEAL DELIBERATION COMPLETED.");
        setStep(3);
        addLog("✓ RECORD UPDATED IN BLOCK ARCHIVES.");
        alert("Appeal process finished! Please check verification console or leak profile to view outcomes.");
      } else {
        addLog(`❌ APPEAL FAILED: ${res.error}`);
        setStep(0);
      }
    } catch (err: any) {
      addLog(`❌ TRANSACTION FAILED: ${err.message || err}`);
      setStep(0);
    } finally {
      setIsAppealing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-cyber animate-pulse">
        [ DEADDROP PROTOCOL WAKING UP... ]
      </div>
    );
  }

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      <Header />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col font-mono text-xs gap-8">
        <div>
          <Link
            href={`/leaks/${leakId}`}
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to leak detail
          </Link>
        </div>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-background-border pb-6 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Consensus Re-evaluation</span>
            <h1 className="text-3xl font-serif text-fafafa italic tracking-wide mt-1">
              Appeal Forensic Rejection
            </h1>
          </div>
          <p className="text-zinc-500 text-xs max-w-sm">
            Rejected submissions can be appealed within 7 days by staking 5 GEN and providing new evidence urls.
          </p>
        </div>

        {/* Leak Context */}
        {leak && (
          <div className="p-5 bg-background-card border border-primary/20 rounded-lg space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              ORIGINAL DISPUTE DETAILS
            </span>
            <div className="space-y-1 text-zinc-400 font-sans text-xs">
              <p className="font-bold text-zinc-200">{leak.title}</p>
              <p className="text-[11px] text-zinc-500">Target Entity: {leak.target_entity}</p>
              <div className="mt-2 p-3 bg-black border border-background-border rounded font-mono text-[11px]">
                <span className="text-zinc-600 block uppercase font-bold tracking-widest mb-1">Original Rejection Reason:</span>
                {leak.ai_reasoning}
              </div>
            </div>
          </div>
        )}

        {/* Form & Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Form (5/12 width) */}
          <form onSubmit={handleAppeal} className="md:col-span-5 bg-background-card border border-background-border rounded-lg p-5 space-y-4 shadow-md">
            <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold border-b border-background-border pb-3 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-cyber" />
              SUBMIT EVIDENCE & STAKE
            </h3>

            <div className="space-y-2">
              <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">Additional Evidence URLs</label>
              <textarea
                required
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Paste new urls containing proof (one per line)..."
                rows={4}
                className="w-full bg-background border border-background-border focus:border-cyber rounded px-3 py-2 text-xs outline-none font-mono resize-none leading-relaxed text-zinc-300"
              />
              <span className="text-[9px] text-zinc-600 block font-sans">
                Validators will fetch the text contents of these URLs and perform a comparative analysis against public filing coordinates.
              </span>
            </div>

            <div className="p-3 bg-black/40 border border-background-border rounded space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">Appeal Cost</span>
              <span className="text-xs font-bold text-white">5.0000 GEN</span>
              <span className="text-[9px] text-zinc-500 block leading-relaxed font-sans">
                If the appeal is UPHELD (rejection confirmed), your 5 GEN stake is forfeited. If OVERTURNED (status changes to VERIFIED), your 5 GEN is fully refunded.
              </span>
            </div>

            <button
              type="submit"
              disabled={isAppealing || step === 3}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/95 border border-primary text-white font-bold uppercase tracking-widest rounded text-center transition-all flex items-center justify-center gap-1.5 shadow-red-glow cursor-pointer"
            >
              {isAppealing ? "PROCESSING STAKE..." : step === 3 ? "Appeal finished" : "File On-Chain Appeal"}
            </button>
          </form>

          {/* Console (7/12 width) */}
          <div className="md:col-span-7 bg-background-card border border-background-border rounded-lg p-5 flex flex-col gap-4 shadow-md">
            <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold border-b border-background-border pb-3">
              APPELLATE DELIBERATION STREAM
            </h3>

            {logs.length > 0 ? (
              <div className="border border-background-border rounded bg-zinc-950 p-4 font-mono text-[10px] text-cyber space-y-1 relative min-h-[180px]">
                {logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">{log}</div>
                ))}
                {isAppealing && (
                  <div className="terminal-caret inline-block animate-pulse">EVALUATING STACKS...</div>
                )}
              </div>
            ) : (
              <div className="border border-background-border rounded bg-zinc-950/40 p-8 font-mono text-[10px] text-zinc-600 text-center italic">
                [ Console idle. Submit new evidence and lock stake to start the appellate consensus stream. ]
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
