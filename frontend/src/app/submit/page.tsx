"use client";

import React, { useEffect, useState } from 'react';
import { useStore, LeakRecord } from '@/store/useStore';
import Header from '@/components/Header';
import SecurityChecklist from '@/components/SecurityChecklist';
import AnonymousModeToggle from '@/components/AnonymousModeToggle';
import BurnerWalletGenerator from '@/components/BurnerWalletGenerator';
import EvidenceUploader from '@/components/EvidenceUploader';
import AIVerdictDisplay from '@/components/AIVerdictDisplay';
import { ShieldAlert, Flame, FileText, ArrowRight, Check, AlertTriangle, Key, Cpu, HelpCircle, Download } from 'lucide-react';
import Link from 'next/link';

export default function SubmitLeak() {
  const {
    securityChecklistCompleted,
    pseudonymousIdentity,
    isSubmitting,
    terminalLogs,
    submitLeak,
    initializeStore
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("corporate_fraud");
  const [targetEntity, setTargetEntity] = useState("");
  const [summary, setSummary] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [docHash, setDocHash] = useState("");

  // Result display
  const [resultRecord, setResultRecord] = useState<LeakRecord | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

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

  // Visual Category selectors
  const categoriesList = [
    { id: "corporate_fraud", label: "Corporate Fraud", desc: "Anti-trust, regulatory evasion, offshore accounts" },
    { id: "government", label: "Government Misconduct", desc: "Bribery, unconstitutional oversight, classified malfeasance" },
    { id: "environmental", label: "Environmental Crimes", desc: "Chemical spills, toxic dumping, illegal logging coordinates" },
    { id: "healthcare", label: "Healthcare Abuses", desc: "Price gouging, untested devices, clinical data suppression" },
    { id: "tech", label: "Tech & Privacy Violations", desc: "Mass surveillance backdoor integrations, data mining logs" },
    { id: "finance", label: "Financial Crimes", desc: "Market manipulation, SEC filings fraud, insider trading ledgers" },
    { id: "other", label: "Other / Classified", desc: "General whistleblowing evidence leaks" }
  ];

  // Helper to handle final submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetEntity || !summary || !docHash) {
      alert("Please fill in all required fields and upload/hash a document.");
      return;
    }

    setStep(6); // Go to terminal audit simulator step
    const res = await submitLeak(
      title,
      category,
      targetEntity,
      summary,
      evidenceUrls,
      docHash
    );

    if (res.success && res.record) {
      setResultRecord(res.record);
      setShowResultModal(true);
    } else {
      alert("Consensus proposal error: " + (res.error || "Unknown error"));
      setStep(5); // Go back to review
    }
  };

  // Helper to download key files
  const downloadSecretKey = () => {
    if (!pseudonymousIdentity) return;
    const element = document.createElement("a");
    const file = new Blob([
      `=== DEADDROP IDENTITY ESCROW SECRET ===\n`,
      `DATE: ${new Date().toISOString()}\n`,
      `PUBLIC IDENTITY HASH (ON-CHAIN ID): ${pseudonymousIdentity.pubkey}\n`,
      `SECRET REPUTATION SEED (PRIVATE KEY): ${pseudonymousIdentity.privkey}\n\n`,
      `⚠️ WARNING: Keep this file private. It is the only proof that you are the author of your submissions. `,
      `You need this secret seed to claim bounties anonymously.`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `deaddrop_seed_${pseudonymousIdentity.pubkey.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper to download submission receipt
  const downloadReceipt = () => {
    if (!resultRecord) return;
    const element = document.createElement("a");
    const file = new Blob([
      `=== DEADDROP CRYPTOGRAPHIC TRANSACTION RECEIPT ===\n`,
      `STATUS: ${resultRecord.status}\n`,
      `LEAK ID HASH: ${resultRecord.leak_id}\n`,
      `DOCUMENT SHA-256 HASH: ${resultRecord.document_hash}\n`,
      `SUBMITTER PUBKEY: ${resultRecord.submitter_pubkey}\n`,
      `TIMESTAMP: ${new Date(resultRecord.submission_timestamp * 1000).toUTCString()}\n\n`,
      `=== AI AUDIT REPORT ===\n`,
      `CREDIBILITY RATING: ${resultRecord.credibility_score}/100\n`,
      `PUBLIC INTEREST RATING: ${resultRecord.public_interest_score}/100\n`,
      `IMPACT ASSESSMENT: ${resultRecord.estimated_impact}\n`,
      `FINDINGS:\n${resultRecord.ai_reasoning}\n\n`,
      `This receipt serves as mathematical proof that your leak's fingerprint was written on the GenLayer blockchain.`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `deaddrop_receipt_${resultRecord.leak_id.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* OPSEC Checklist gating modal */}
      <SecurityChecklist />

      {/* Global Navigation Header */}
      <Header />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 flex flex-col font-mono text-xs">
        {/* Step Progression Visualizer */}
        {step < 6 && (
          <div className="grid grid-cols-5 gap-2 border-b border-background-border pb-6 mb-8 text-center text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            <div className={`${step >= 1 ? 'text-primary font-bold' : ''}`}>01 Transmitter</div>
            <div className={`${step >= 2 ? 'text-primary font-bold' : ''}`}>02 Classify</div>
            <div className={`${step >= 3 ? 'text-primary font-bold' : ''}`}>03 Intel Details</div>
            <div className={`${step >= 4 ? 'text-primary font-bold' : ''}`}>04 Evidence</div>
            <div className={`${step >= 5 ? 'text-primary font-bold' : ''}`}>05 Review</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* STEP 1: Wallet transmitter channels */}
          {step === 1 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fafafa">
                  [ STEP 1: CONFIGURE TRANSMISSION CHANNEL ]
                </h2>
                <p className="text-zinc-500 font-sans leading-relaxed text-[11px]">
                  Select the channel through which you want to submit your leak transaction. 
                  We highly recommend using our **Burner Wallet** (default) to maximize OPSEC anonymity.
                </p>
              </div>

              {/* OPSEC Switcher toggle */}
              <AnonymousModeToggle />

              {/* Ephemeral credentials block */}
              <BurnerWalletGenerator />

              <div className="pt-4 border-t border-background-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-widest rounded border border-primary transition-all shadow-red-glow cursor-pointer"
                >
                  Configure Classification
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category classifier */}
          {step === 2 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fafafa">
                  [ STEP 2: INTEL CLASSIFICATION ]
                </h2>
                <p className="text-zinc-500 font-sans leading-relaxed text-[11px]">
                  Select the category that best matches your whistleblowing documents. 
                  This determines which bounty pools you are eligible to claim and shapes the AI editor prompt.
                </p>
              </div>

              {/* Selector grid */}
              <div className="space-y-2">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 bg-background-card border rounded-lg cursor-pointer transition-all flex items-start gap-4 hover:border-zinc-800 ${
                      category === cat.id 
                        ? 'border-primary/40 bg-primary/[0.01]' 
                        : 'border-background-border'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="mt-1 accent-primary h-3.5 w-3.5 shrink-0 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-zinc-300 uppercase block">{cat.label}</span>
                      <span className="text-zinc-500 text-[10px] font-sans block mt-0.5">{cat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-background-border flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-background border border-background-border text-zinc-400 hover:text-white rounded transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-widest rounded border border-primary transition-all shadow-red-glow cursor-pointer"
                >
                  Enter Intel Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Leak Text fields */}
          {step === 3 && (
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fafafa">
                  [ STEP 3: INTEL & TARGET DETAILS ]
                </h2>
                <p className="text-zinc-500 font-sans leading-relaxed text-[11px]">
                  Provide a brief, editorial headline and a highly detailed summary. 
                  Include specific coordinates, names, dates, amounts, and institutional branches. 
                  The AI Gatekeeper will evaluate this description against public records to check credibility.
                </p>
              </div>

              <div className="space-y-4">
                {/* Target Entity */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Target Entity (Company / Government agency)</label>
                  <input
                    type="text"
                    required
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                    placeholder="e.g. Apex Shipping Corp, Senator Jenkins Office"
                    className="w-full bg-background border border-background-border focus:border-primary rounded px-3 py-2.5 text-xs text-zinc-300 outline-none"
                  />
                </div>

                {/* Leak Title */}
                <div className="space-y-1.5">
                  <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Leak Editorial Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Concentrated PFAS Ocean Dumping Coordinates"
                    className="w-full bg-background border border-background-border focus:border-primary rounded px-3 py-2.5 text-xs text-zinc-300 outline-none"
                  />
                </div>

                {/* Leak Summary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider">Forensic Intel Summary</label>
                    <span className={`font-semibold ${summary.length > 2000 ? 'text-primary' : 'text-zinc-500'}`}>
                      {summary.length}/2000
                    </span>
                  </div>
                  <textarea
                    required
                    maxLength={2000}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Explain the wrongdoing in detail. What did they dump/steal? When? Who approved it? Provide exact ledger dates and details to assist the AI consensus verify your claims..."
                    rows={8}
                    className="w-full bg-background border border-background-border focus:border-primary rounded px-3 py-2.5 text-xs text-zinc-300 outline-none leading-relaxed font-sans"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-background-border flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-background border border-background-border text-zinc-400 hover:text-white rounded transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!title || !targetEntity || !summary}
                  onClick={() => setStep(4)}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 font-bold uppercase tracking-widest rounded border transition-all ${
                    title && targetEntity && summary 
                      ? 'bg-primary border-primary text-white hover:bg-primary/95 shadow-red-glow cursor-pointer' 
                      : 'bg-background-elevated border-background-border text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  Load Evidence Proofs
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Document Hashing & urls */}
          {step === 4 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fafafa">
                  [ STEP 4: ENCRYPTION & EVIDENCE LOADS ]
                </h2>
                <p className="text-zinc-500 font-sans leading-relaxed text-[11px]">
                  Securely hash your local whistleblower files in the browser sandbox and list online evidence coordinates. 
                  The AI consensus editor uses these public coordinates to crawl and audit your leak on-chain.
                </p>
              </div>

              {/* Dynamic Evidence Uploader */}
              <EvidenceUploader
                onDocumentHashCalculated={(hash) => setDocHash(hash)}
                onUrlsChanged={(urls) => setEvidenceUrls(urls)}
              />

              <div className="pt-4 border-t border-background-border flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-background border border-background-border text-zinc-400 hover:text-white rounded transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!docHash}
                  onClick={() => setStep(5)}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 font-bold uppercase tracking-widest rounded border transition-all ${
                    docHash 
                      ? 'bg-primary border-primary text-white hover:bg-primary/95 shadow-red-glow cursor-pointer' 
                      : 'bg-background-elevated border-background-border text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  Escrow Identity Seed
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Pseudonymous Escrow and Final review */}
          {step === 5 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-fafafa">
                  [ STEP 5: CRYPTOGRAPHIC IDENTITY PERSISTENCE ]
                </h2>
                <p className="text-zinc-500 font-sans leading-relaxed text-[11px]">
                  Before launching the transmission, download your pseudonymous identity seed. 
                  This seed builds reputation across your leaks and serves as the **only secret** needed to claim DAO bounties. 
                  No usernames, no real-world details.
                </p>
              </div>

              {/* Identity lock */}
              {pseudonymousIdentity && (
                <div className="p-4 bg-background-card border border-cyber/20 rounded-lg space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">
                        PSEUDONYMOUS IDENTITY PUBKEY
                      </span>
                      <p className="text-[11px] text-cyber font-mono select-all break-all mt-1 pr-6">
                        {pseudonymousIdentity.pubkey}
                      </p>
                    </div>
                    <button
                      onClick={downloadSecretKey}
                      type="button"
                      className="p-2 shrink-0 rounded bg-background border border-background-border text-cyber hover:text-white hover:bg-background-border transition-all flex items-center justify-center gap-1.5"
                      title="Download secret credentials"
                    >
                      <Download className="w-4 h-4" />
                      Download Seed
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-normal border-t border-background-border pt-3">
                    🔐 Your on-chain reputation: <span className="font-semibold text-zinc-300">100/1000</span>. 
                    Submitting verified leaks boosts this reputation. Releasing spam or malicious fake documents penalizes it. 
                    Download the backup credentials txt file and store it in an encrypted USB vault.
                  </p>
                </div>
              )}

              {/* Review summary cards */}
              <div className="p-4 bg-background border border-background-border rounded space-y-3 font-sans">
                <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono block tracking-widest">
                  TRANSMISSION MANIFEST
                </span>
                <div className="space-y-2 text-xs leading-normal">
                  <p className="text-zinc-400 font-mono">
                    <span className="text-zinc-500 font-bold uppercase inline-block w-24">Target:</span> 
                    {targetEntity}
                  </p>
                  <p className="text-zinc-400 font-mono">
                    <span className="text-zinc-500 font-bold uppercase inline-block w-24">Title:</span> 
                    {title}
                  </p>
                  <p className="text-zinc-400 font-mono">
                    <span className="text-zinc-500 font-bold uppercase inline-block w-24">Category:</span> 
                    {category}
                  </p>
                  <p className="text-zinc-400 font-mono">
                    <span className="text-zinc-500 font-bold uppercase inline-block w-24">File Proof:</span> 
                    <span className="text-cyber select-all">{docHash}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-background-border flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 bg-background border border-background-border text-zinc-400 hover:text-white rounded transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-widest rounded border border-primary transition-all shadow-red-glow cursor-pointer animate-pulse-slow"
                >
                  <Flame className="w-4 h-4 animate-bounce" />
                  INITIATE AUDIT TRANSMISSION
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Terminal consensus emulator (during submission) */}
          {step === 6 && (
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="border border-background-border rounded-lg bg-zinc-950 p-6 shadow-cyber-glow scanlines min-h-[350px] flex flex-col">
                {/* Simulated CRT Screen Header */}
                <div className="flex items-center justify-between border-b border-background-border pb-3 mb-4 font-mono text-[9px] text-zinc-500">
                  <span>SYSTEM: DEADDROP DECLASSIFIED CORE</span>
                  <span>ENCRYPTION: SHAKE-256</span>
                </div>

                {/* Animated terminal streams */}
                <div className="flex-1 space-y-2 font-mono text-[11px] text-cyber select-text overflow-y-auto leading-relaxed max-h-[300px]">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                  {isSubmitting && (
                    <div className="terminal-caret inline-block animate-pulse">
                      WAITING FOR BLOCKCHAIN SYNDICATE CONSENSUS...
                    </div>
                  )}
                </div>
              </div>

              {/* Show final result button when complete */}
              {!isSubmitting && resultRecord && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowResultModal(true)}
                    className="flex items-center justify-center gap-1.5 px-6 py-3 bg-success hover:bg-success/90 text-fafafa font-bold uppercase tracking-widest rounded border border-success transition-all shadow-emerald-glow cursor-pointer"
                  >
                    View Audit Verdict
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* FINAL AUDIT RESULT POPUP OVERLAY */}
      {showResultModal && resultRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-background-card border border-background-border rounded-lg p-6 shadow-cyber-glow max-h-[90vh] overflow-y-auto font-mono text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-background-border pb-4 mb-5">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Consensus Finished</span>
                <h2 className="text-base font-bold text-fafafa tracking-wider uppercase mt-0.5">
                  📁 Leak Submission Report
                </h2>
              </div>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                resultRecord.status === 'VERIFIED' ? 'text-success border-success/30 bg-success/5' : 'text-primary border-primary/30 bg-primary/5'
              }`}>
                {resultRecord.status}
              </span>
            </div>

            {/* Verdict Visualization Panel */}
            <AIVerdictDisplay verdict={resultRecord} />

            {/* CryptographicReceipt receipt coordinates */}
            <div className="mt-5 p-4 bg-background border border-background-border rounded space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block">
                CRYPTOGRAPHIC PLATFORM CODES
              </span>
              <div className="space-y-1.5 text-[10px] text-zinc-400 break-all select-all">
                <p><span className="text-zinc-600 font-bold uppercase inline-block w-24">Leak Hash ID:</span> {resultRecord.leak_id}</p>
                <p><span className="text-zinc-600 font-bold uppercase inline-block w-24">Doc Hash:</span> {resultRecord.document_hash}</p>
                <p><span className="text-zinc-600 font-bold uppercase inline-block w-24">Submitter ID:</span> {resultRecord.submitter_pubkey}</p>
              </div>
            </div>

            {/* Overlay buttons */}
            <div className="mt-6 pt-4 border-t border-background-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                onClick={downloadReceipt}
                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-background-border hover:border-cyber text-zinc-300 hover:text-white rounded transition-all"
              >
                <Download className="w-4 h-4" />
                Download Cryptographic Receipt
              </button>

              <div className="flex gap-2">
                <Link
                  href="/leaks"
                  className="px-4 py-2 bg-background border border-background-border hover:border-zinc-700 text-zinc-400 hover:text-white text-center rounded transition-all"
                >
                  View Archive
                </Link>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    // Reset page state
                    setStep(1);
                    setTitle("");
                    setTargetEntity("");
                    setSummary("");
                    setDocHash("");
                    setEvidenceUrls([]);
                  }}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-widest text-center rounded border border-primary transition-all shadow-red-glow"
                >
                  Submit Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
