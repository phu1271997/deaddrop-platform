"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import LeakCard from '@/components/LeakCard';
import Link from 'next/link';
import { Flame, ShieldAlert, Award, ArrowRight, CheckCircle2, ChevronRight, Fingerprint, Eye } from 'lucide-react';

export default function Home() {
  const { stats, verifiedLeaks, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-cyber">
        [ DEADDROP PROTOCOL WAKING UP... ]
      </div>
    );
  }

  // Visual features list
  const steps = [
    {
      num: "01",
      title: "ANONYMIZE",
      desc: "Instant client-side burner wallet generation and metadata stripping directives keep you untraceable."
    },
    {
      num: "02",
      title: "SUBMIT HASH",
      desc: "Paste document hash and public validation links. The raw document never leaves your machine."
    },
    {
      num: "03",
      title: "AI AUDIT CONSENSUS",
      desc: "GenLayer validators run AI editors to cross-reference evidence against public filings and directories."
    },
    {
      num: "04",
      title: "PUBLISH",
      desc: "Verified leaks are permanently written on-chain, triggering automatic bounty payouts to burner addresses."
    }
  ];

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-20 flex flex-col items-center justify-center text-center">
        {/* Espionage warning badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-widest font-mono uppercase font-bold rounded-full mb-6 animate-pulse-slow">
          <ShieldAlert className="w-3.5 h-3.5" />
          ACTIVE INTEL CHANNEL OPEN
        </div>

        {/* Cinematic editorial title */}
        <h1 className="text-4xl sm:text-6xl md:text-7.5xl font-serif text-white max-w-4xl tracking-tight leading-[1.05] italic mb-6">
          The truth has a new <br />
          <span className="text-primary not-italic font-sans font-extrabold uppercase tracking-wide glow-red">
            un-deletable
          </span> address.
        </h1>

        {/* Monospace Sub-typewriter */}
        <div className="font-mono text-cyber text-xs xs:text-sm tracking-wider max-w-2xl bg-zinc-950/60 border border-background-border rounded px-4 py-2 mb-8 shadow-cyber-glow">
          <span className="terminal-caret">[ READY TO SECURELY RECEIVE DECLASSIFIED CORRESPONDENCE ]</span>
        </div>

        <p className="text-zinc-400 font-sans text-sm sm:text-base max-w-xl leading-relaxed mb-10">
          DeadDrop is a decentralized, censorship-resistant platform built on GenLayer blockchain. 
          Our AI consensus audit network verifies leaked documents against public records before publishing, 
          protecting both sources and journalistic integrity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/submit"
            className="w-full sm:w-48 py-3 px-6 bg-primary hover:bg-primary/95 text-white font-mono text-xs tracking-widest font-bold uppercase rounded border border-primary transition-all shadow-red-glow flex items-center justify-center gap-2 group"
          >
            <Flame className="w-4 h-4 text-white group-hover:scale-110 transition-all" />
            Submit Leak
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/leaks"
            className="w-full sm:w-48 py-3 px-6 bg-background-elevated hover:bg-background-border border border-background-border hover:border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs tracking-widest font-bold uppercase rounded transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-cyber" />
            Browse Archive
          </Link>
        </div>
      </section>

      {/* Ticker / Platform Statistics */}
      <section className="border-y border-background-border bg-background-card/40 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">Submitted Leaks</span>
              <p className="text-3xl font-mono font-extrabold text-fafafa">{stats.total_leaks_submitted}</p>
            </div>
            <div className="space-y-1">
              <span className="text-success font-mono text-[10px] tracking-widest uppercase">Verified Leaks</span>
              <p className="text-3xl font-mono font-extrabold text-success glow-cyan">{stats.total_leaks_verified}</p>
            </div>
            <div className="space-y-1">
              <span className="text-primary font-mono text-[10px] tracking-widest uppercase">Spam Rejected</span>
              <p className="text-3xl font-mono font-extrabold text-primary">{stats.total_leaks_rejected}</p>
            </div>
            <div className="space-y-1">
              <span className="text-accent font-mono text-[10px] tracking-widest uppercase">Bounty Pools</span>
              <p className="text-3xl font-mono font-extrabold text-accent">
                {(parseFloat(stats.total_bounty_pool) / 1e18).toFixed(1)} GEN
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <h2 className="editorial-title text-3xl sm:text-4xl text-center text-white mb-16 italic">
          A secure audit trail from encryption to publication.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div 
              key={i}
              className="p-5 bg-background-card border border-background-border rounded-lg relative hover:border-zinc-800 transition-all font-mono"
            >
              <span className="text-zinc-700 text-3xl font-black block mb-4">{step.num}</span>
              <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-bold mb-2">{step.title}</h3>
              <p className="text-zinc-500 font-sans text-[11px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparative Matrix Section */}
      <section className="border-t border-background-border bg-zinc-950/40 py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="editorial-title text-3xl sm:text-4xl text-center text-white mb-16 italic">
            Why DeadDrop?
          </h2>

          <div className="overflow-x-auto border border-background-border rounded-lg bg-background-card">
            <table className="w-full font-mono text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-background-border bg-background-elevated text-zinc-500 text-[10px] tracking-widest uppercase">
                  <th className="p-4">Feature Matrix</th>
                  <th className="p-4 text-primary font-bold">DeadDrop</th>
                  <th className="p-4">WikiLeaks</th>
                  <th className="p-4">SecureDrop</th>
                  <th className="p-4">Twitter/X</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-border text-zinc-400">
                <tr>
                  <td className="p-4 font-sans font-semibold text-zinc-200">Censorship-Resistant Ledger</td>
                  <td className="p-4 text-success font-bold">✅ Yes (GenLayer)</td>
                  <td className="p-4">❌ Centralized Web</td>
                  <td className="p-4">❌ Tor Hidden Service</td>
                  <td className="p-4">❌ Corporate Takedowns</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-semibold text-zinc-200">AI consensus validation</td>
                  <td className="p-4 text-success font-bold">✅ Yes (On-Chain)</td>
                  <td className="p-4">❌ Manual Editor Review</td>
                  <td className="p-4">❌ Manual Editor Review</td>
                  <td className="p-4">❌ Community Notes (Slow)</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-semibold text-zinc-200">Zero-Metadata Uploads</td>
                  <td className="p-4 text-success font-bold">✅ Yes (Only Hash On-Chain)</td>
                  <td className="p-4">❌ Full Files Uploaded</td>
                  <td className="p-4">❌ Full Files Uploaded</td>
                  <td className="p-4">❌ Stripped but Traced</td>
                </tr>
                <tr>
                  <td className="p-4 font-sans font-semibold text-zinc-200">Pseudonymous Bounty Rewards</td>
                  <td className="p-4 text-success font-bold">✅ Yes (DAO Pools)</td>
                  <td className="p-4">❌ None</td>
                  <td className="p-4">❌ None</td>
                  <td className="p-4">❌ Ad Revenue (Doxxed)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent Verified Archive Preview */}
      <section className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="flex items-center justify-between border-b border-background-border pb-4 mb-10">
          <h2 className="editorial-title text-2xl sm:text-3xl text-white italic">
            Recent verified intel leaks
          </h2>
          <Link
            href="/leaks"
            className="flex items-center gap-1 text-xs font-mono text-cyber hover:text-white uppercase font-bold tracking-widest transition-all"
          >
            View Full Archive
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verifiedLeaks.slice(0, 2).map((leak) => (
            <LeakCard key={leak.leak_id} leak={leak} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-background-border bg-zinc-950/80 py-12 font-mono text-xs text-zinc-600 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-base text-zinc-400">DeadDrop</span>
            <span>|</span>
            <span className="text-[10px] tracking-widest text-zinc-500">THE TRUTH, UNTAMPED.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] tracking-wider uppercase font-semibold">
            <Link href="/docs/security.md" className="hover:text-fafafa transition-all">SECURITY MANIFESTO</Link>
            <span>•</span>
            <Link href="/docs/ethics.md" className="hover:text-fafafa transition-all">ETHICAL FILTERING</Link>
            <span>•</span>
            <Link href="/docs/architecture.md" className="hover:text-fafafa transition-all">AI GATEKEEPER CONSENSUS</Link>
          </div>

          <span className="text-[9px] text-zinc-700">
            © 2026 DeadDrop. Completely decentralized and open source.
          </span>
        </div>
      </footer>
    </div>
  );
}
