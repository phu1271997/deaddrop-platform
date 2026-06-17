"use client";

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useStore, LeakRecord } from '@/store/useStore';
import LeakCard from '@/components/LeakCard';
import { ShieldAlert, BookOpen, AlertTriangle, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';

export default function DemoGallery() {
  const { initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

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

  // Define 3 demo leaks representing the 3 primary consensus outcomes
  const demoLeaks: LeakRecord[] = [
    {
      leak_id: "demo_leak_1_corporate_fraud_verified_hash_coordinates",
      title: "PFAS Ocean Chemical Dumping Logbooks",
      category: "environmental",
      target_entity: "Apex Corp Industries",
      summary: "Internal logistics schedules and cargo manifests indicating Apex vessels systematically dumped toxic chemical waste in offshore conservation zones to evade environmental cleanup tariffs.",
      evidence_urls: ["https://apex-internal-logs.is/vessels/logs_2025"],
      document_hash: "22d3ee89d318e8f8283bbd73b0638708c3bf37c68a44b41fb386f6deae98f8222a",
      submitter_pubkey: "e44b41fb386f6deae98f828ff127f89d318e8f828bbd73b0638708e44b55a881bc",
      submission_timestamp: 1779951600,
      status: "VERIFIED",
      credibility_score: 92,
      public_interest_score: 85,
      ai_verdict: "VERIFIED",
      ai_reasoning: "The submission matches satellite ship tracking logs. The documents contain authentic templates, matching Apex corporate tax records. High credibility, critical public interest.",
      red_flags: [],
      recommended_followup: "Investigate local port control logs for suspected bribery indicators.",
      estimated_impact: "CRITICAL"
    },
    {
      leak_id: "demo_leak_2_corporate_fraud_rejected_spam_hash_codes",
      title: "Secret Board Meeting Whispers on Competitor Takeover",
      category: "corporate_fraud",
      target_entity: "OmniCorp Global",
      summary: "My boss whispered that we are going to tank the competitor's stock price next Tuesday by launching a media smear campaign. Highly confidential, they must be stopped.",
      evidence_urls: ["https://gossip-forums.net/threads/99128"],
      document_hash: "f59e0b83b0638708c3bf37c68a44b41fb386f6deae98f828ff127f89d318e8f828",
      submitter_pubkey: "b37c68a44b41fb386f6deae98f828ff127f89d318e8f828bbd73b0638708e44b",
      submission_timestamp: 1779836400,
      status: "REJECTED",
      credibility_score: 28,
      public_interest_score: 35,
      ai_verdict: "REJECTED",
      ai_reasoning: "Forensic analysis reveals a personal vendetta indicator. The submission contains no concrete documents, only hearsay, and the referenced URL is an unverified public forum thread. Rejected due to insufficient evidence quality.",
      red_flags: ["Lacks document metadata", "Defamation warning", "Hearsay indicators"],
      recommended_followup: "Do not investigate without primary document proof.",
      estimated_impact: "LOW"
    },
    {
      leak_id: "demo_leak_3_corporate_fraud_disputed_appeal_hash_codes",
      title: "Mass Surveillance Backdoor in Global Router Shipments",
      category: "tech",
      target_entity: "NetCore Systems",
      summary: "NetCore router firmwares shipped to government agencies contain hidden SSH backdoor credentials. The files submitted include the decompiled firmware code.",
      evidence_urls: ["https://netcore-backdoor-logs.org/findings"],
      document_hash: "dd3ee89d318e8f8283bbd73b0638708c3bf37c68a44b41fb386f6deae98f8222a8",
      submitter_pubkey: "a28bbd73b0638708c3bf37c68a44b41fb386f6deae98f828ff127f89d318e8f828",
      submission_timestamp: 1779750000,
      status: "VERIFIED", // Appeal overturned
      credibility_score: 81,
      public_interest_score: 95,
      ai_verdict: "VERIFIED",
      ai_reasoning: "Original submission was REJECTED due to incomplete source files. Upon appeal, submitter staked 5 GEN and uploaded the full decompiled ELF firmware. Independent AI validators verified the backdoors on-chain. Overturned to VERIFIED.",
      red_flags: [],
      recommended_followup: "Audit NetCore router firmwares shipped between Q3 2025 and Q2 2026.",
      estimated_impact: "CRITICAL"
    }
  ];

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <Header />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col font-mono text-xs gap-8">
        {/* Title bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-background-border pb-6 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Consensus Showcase Gallery</span>
            <h1 className="text-3xl font-serif text-fafafa italic tracking-wide mt-1">
              Consensus Demo Scenarios
            </h1>
          </div>
          <p className="text-zinc-500 text-xs max-w-sm">
            Quick preview of the three key AI validation outputs: verified, rejected, and overturned on appeal.
          </p>
        </div>

        {/* Demo Overview Callout */}
        <div className="p-4 bg-zinc-950 border border-background-border rounded-lg space-y-3 leading-relaxed">
          <span className="text-cyber text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            JUDGES AND DEVELOPERS NOTE:
          </span>
          <p className="text-zinc-400 font-sans text-xs">
            These mock leaks demonstrate how the platform UI reacts to real on-chain transaction outcomes. 
            You can verify each leak&apos;s signature directly by clicking the <strong>Verify on Chain</strong> button inside their detail views, 
            or try claiming their assigned bounties inside the claim portal.
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Scenario 1: Verified */}
          <div className="p-5 bg-background-card border border-success/20 hover:border-success/40 rounded-lg flex flex-col justify-between shadow-md">
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded border text-[9px] font-bold text-success border-success/30 bg-success/5 uppercase self-start">
                VERIFIED (SCENARIO A)
              </span>
              <h3 className="text-xs text-zinc-300 font-bold uppercase tracking-wider font-mono">
                Authentic Whistleblower Leak
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                Demonstrates a successful submission. The AI auditor found specific dumping coordinates, templates, and public ship tracking registries matching the summary, leading to approval.
              </p>
            </div>
            <Link
              href={`/leaks/${demoLeaks[0].leak_id}`}
              className="mt-6 w-full py-2.5 px-4 bg-success/10 hover:bg-success/20 border border-success/20 text-success hover:text-white font-bold uppercase tracking-widest rounded text-center transition-all flex items-center justify-center gap-1.5"
            >
              Inspect Report
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scenario 2: Rejected */}
          <div className="p-5 bg-background-card border border-primary/20 hover:border-primary/40 rounded-lg flex flex-col justify-between shadow-md">
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded border text-[9px] font-bold text-primary border-primary/30 bg-primary/5 uppercase self-start">
                REJECTED (SCENARIO B)
              </span>
              <h3 className="text-xs text-zinc-300 font-bold uppercase tracking-wider font-mono">
                Low Quality / Gossip Spam
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                Demonstrates a filtered submission. The AI auditor flagged the report for lack of primary documents, hearsay keywords, and gossip, rejecting it with a credibility score of 28.
              </p>
            </div>
            <Link
              href={`/leaks/${demoLeaks[1].leak_id}`}
              className="mt-6 w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-white font-bold uppercase tracking-widest rounded text-center transition-all flex items-center justify-center gap-1.5"
            >
              Inspect Flags
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scenario 3: Appeal Overturned */}
          <div className="p-5 bg-background-card border border-accent/20 hover:border-accent/40 rounded-lg flex flex-col justify-between shadow-md">
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded border text-[9px] font-bold text-accent border-accent/30 bg-accent/5 uppercase self-start">
                DISPUTED (SCENARIO C)
              </span>
              <h3 className="text-xs text-zinc-300 font-bold uppercase tracking-wider font-mono">
                Appeal Overturned Verdict
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                Demonstrates the appeal pipeline. Originally rejected, the whistleblower staked 5 GEN, provided the missing SSH key, and the AI panel overturned the verdict to VERIFIED.
              </p>
            </div>
            <Link
              href={`/leaks/${demoLeaks[2].leak_id}`}
              className="mt-6 w-full py-2.5 px-4 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent hover:text-white font-bold uppercase tracking-widest rounded text-center transition-all flex items-center justify-center gap-1.5"
            >
              Inspect Appeal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Selected Scenarios Cards Detail list */}
        <div className="space-y-6 mt-6">
          <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            PREVIEW MANIFEST DETAILS
          </span>
          <div className="grid grid-cols-1 gap-6">
            {demoLeaks.map((leak) => (
              <LeakCard key={leak.leak_id} leak={leak} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
