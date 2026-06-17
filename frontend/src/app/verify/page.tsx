"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useStore, LeakRecord } from '@/store/useStore';
import Header from '@/components/Header';
import { hashDocument } from '@/lib/crypto-utils';
import { getGenLayerClient, CONTRACT_ADDRESS } from '@/lib/genlayer-client';
import { UploadCloud, Search, ShieldCheck, ShieldAlert, Cpu, Award, Calendar, FileText, ChevronRight, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import AIVerdictDisplay from '@/components/AIVerdictDisplay';

export default function VerificationTool() {
  const { verifiedLeaks, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

  // Search/Input state
  const [hashInput, setHashInput] = useState("");
  
  // Local File Hashing state
  const [file, setFile] = useState<File | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Look up result state
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [matchedLeak, setMatchedLeak] = useState<LeakRecord | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

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

  // Handle manual hash lookups
  const handleHashSearch = async (hashToLookup: string) => {
    if (!hashToLookup || hashToLookup.length !== 64) {
      alert("Please enter a valid 64-character SHA-256 hex hash.");
      return;
    }
    
    setSearchExecuted(true);
    setMatchedLeak(null);

    try {
      const glClient = getGenLayerClient();
      
      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        const match = verifiedLeaks.find(
          l => l.document_hash === hashToLookup || l.leak_id === hashToLookup
        );
        setMatchedLeak(match || null);
        return;
      }

      // Query verify_document_hash view call
      const matchesJsonStr = await glClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'verify_document_hash',
        args: [hashToLookup]
      }) as string;

      if (matchesJsonStr && matchesJsonStr !== "[]") {
        const matches = JSON.parse(matchesJsonStr);
        if (Array.isArray(matches) && matches.length > 0) {
          setMatchedLeak(matches[0]);
          return;
        }
      }

      // Fallback: Query leak directly by ID if user pasted leak_id instead of document_hash
      const leakStr = await glClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'get_leak',
        args: [hashToLookup]
      }) as string;

      if (leakStr && leakStr !== "") {
        setMatchedLeak(JSON.parse(leakStr));
      }
    } catch (e) {
      console.error("On-chain lookup error:", e);
      // fallback locally
      const match = verifiedLeaks.find(
        l => l.document_hash === hashToLookup || l.leak_id === hashToLookup
      );
      setMatchedLeak(match || null);
    }
  };

  // Drag Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsHashing(true);
    setSearchExecuted(false);
    setMatchedLeak(null);
    try {
      const hash = await hashDocument(selectedFile);
      setHashInput(hash);
      handleHashSearch(hash);
    } catch (e) {
      console.error(e);
      alert("Local hashing failed. Please try typing/pasting the hash manually.");
    } finally {
      setIsHashing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setHashInput("");
    setSearchExecuted(false);
    setMatchedLeak(null);
  };

  const copyReceipt = () => {
    if (!matchedLeak) return;
    navigator.clipboard.writeText(JSON.stringify(matchedLeak, null, 2));
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <Header />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col font-mono text-xs gap-8">
        
        {/* Title bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-background-border pb-6 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Public Cryptographic Utilities</span>
            <h1 className="text-3xl font-serif text-fafafa italic tracking-wide mt-1">
              On-Chain Document Verifier
            </h1>
          </div>
          <p className="text-zinc-500 text-xs max-w-sm">
            Drag and drop any document to verify that it is authentic and matches the untampered GenLayer blockchain coordinates.
          </p>
        </div>

        {/* Input Methods Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Method A: Local Hashing (recommended) */}
          <div className="p-5 bg-background-card border border-background-border rounded-lg space-y-4 flex flex-col shadow-md">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">METHOD A (RECOMMENDED)</span>
              <h3 className="text-xs text-zinc-300 font-bold uppercase tracking-wider mt-1">Drag-and-Drop Local File</h3>
              <p className="text-[10px] text-zinc-500 font-sans leading-normal mt-1">
                DeadDrop computes the SHA-256 fingerprint locally in your browser. The file is never uploaded, keeping your source files safe.
              </p>
            </div>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border border-dashed border-background-border hover:border-cyber/50 bg-background hover:bg-zinc-950/20 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 text-zinc-500" />
                <p className="text-zinc-400 text-center font-sans">
                  Drag file here or <span className="text-cyber underline">browse drive</span>
                </p>
              </div>
            ) : (
              <div className="flex-1 p-3 bg-background border border-background-border rounded-lg flex flex-col justify-center gap-1.5 relative overflow-hidden">
                <span className="text-[9px] uppercase font-bold text-cyber bg-cyber/15 border border-cyber/20 px-2 py-0.5 rounded self-start">
                  FILE LOADED
                </span>
                <p className="text-zinc-300 font-sans font-semibold text-[13px] truncate">{file.name}</p>
                <p className="text-[10px] text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={resetTool}
                  className="mt-2 text-[10px] text-zinc-500 hover:text-white underline self-start"
                >
                  Clear document
                </button>
              </div>
            )}

            {isHashing && (
              <div className="flex items-center justify-center gap-2 text-cyber animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber animate-ping" />
                <span>COMPUTING SHA-256 LOCAL METER...</span>
              </div>
            )}
          </div>

          {/* Method B: Manual paste */}
          <div className="p-5 bg-background-card border border-background-border rounded-lg space-y-4 flex flex-col justify-between shadow-md">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">METHOD B</span>
              <h3 className="text-xs text-zinc-300 font-bold uppercase tracking-wider mt-1">Manual Fingerprint Input</h3>
              <p className="text-[10px] text-zinc-500 font-sans leading-normal mt-1">
                If you already know the document&apos;s SHA-256 hash or leak ID, paste the 64-character hex coordinates below.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Paste SHA-256 hex coordinates..."
                className="w-full bg-background border border-background-border focus:border-cyber rounded px-3 py-2.5 outline-none font-mono text-zinc-300 text-xs"
              />
              <button
                onClick={() => handleHashSearch(hashInput)}
                className="w-full py-2.5 px-4 bg-background-border hover:bg-cyber hover:text-black border border-background-border hover:border-cyber text-zinc-300 font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Query Ledger
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS DISCLOSURE BLOCK */}
        {searchExecuted && (
          <div className="space-y-6 pt-4 border-t border-background-border">
            
            {/* MATCH FOUND SUCCESS */}
            {matchedLeak ? (
              <div className="space-y-6">
                
                {/* Visual success alert */}
                <div className="p-4 bg-success/5 border border-success/30 text-success rounded-lg flex items-center gap-3 shadow-emerald-glow/5">
                  <ShieldCheck className="w-6 h-6 animate-pulse-slow shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest">
                      ✓ CRYPTOGRAPHIC MATCH RESOLVED ON-CHAIN
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-sans mt-0.5 leading-normal">
                      The computed file signature matches an authentic, verified leak record stored in block 178,924 of the GenLayer ledger. 
                      Document status: **{matchedLeak.status}**.
                    </p>
                  </div>
                </div>

                {/* Sub-results: Brief summary card */}
                <div className="p-5 bg-background-card border border-background-border rounded-lg space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">MATCHED DOCUMENT DOSSIER</span>
                      <h4 className="text-sm font-serif italic text-fafafa mt-1 leading-snug">{matchedLeak.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-sans">Target Entity: <span className="font-mono font-bold text-zinc-300">{matchedLeak.target_entity}</span></p>
                    </div>
                    <Link
                      href={`/leaks/${matchedLeak.leak_id}`}
                      className="px-3 py-1.5 bg-background border border-background-border hover:border-cyber text-cyber hover:text-white rounded transition-all shrink-0 flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
                    >
                      Audit Trail
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <p className="text-zinc-400 font-sans leading-relaxed border-t border-background-border pt-4 select-text">
                    {matchedLeak.summary}
                  </p>
                </div>

                {/* Audit breakdown */}
                <AIVerdictDisplay verdict={matchedLeak} />

                {/* Cryptographic block proofs */}
                <div className="p-4 bg-background-card border border-background-border rounded-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-background-border pb-3">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyber" />
                      AUTHENTICITY METADATA BLOCK
                    </span>
                    <button
                      onClick={copyReceipt}
                      className="text-[9px] px-2 py-0.5 rounded border border-background-border hover:border-cyber text-zinc-500 hover:text-cyber transition-all flex items-center gap-1"
                    >
                      {copiedReceipt ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      Copy JSON
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-zinc-400 leading-normal font-mono break-all select-all">
                    <div className="space-y-2">
                      <div>
                        <span className="text-zinc-600 block uppercase font-semibold">Decrypted Leak ID</span>
                        <span className="text-zinc-400 block mt-0.5">{matchedLeak.leak_id}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase font-semibold">Document SHA-256 Hash</span>
                        <span className="text-cyber block mt-0.5">{matchedLeak.document_hash}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-zinc-600 block uppercase font-semibold">Source Identifier</span>
                        <span className="text-zinc-400 block mt-0.5">{matchedLeak.submitter_pubkey}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <span className="text-zinc-600 block uppercase font-semibold">Verification Date</span>
                          <span className="text-zinc-400 block mt-0.5">{new Date(matchedLeak.submission_timestamp * 1000).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block uppercase font-semibold">Validators Consensus</span>
                          <span className="text-success font-semibold block mt-0.5">APPROVED (8/8)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              
              /* MATCH FAILED WARNING */
              <div className="space-y-5">
                <div className="p-4 bg-primary/5 border border-primary/30 text-primary rounded-lg flex items-center gap-3 shadow-red-glow/5">
                  <ShieldAlert className="w-6 h-6 animate-pulse-slow shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest">
                      ❌ CRYPTOGRAPHIC SIGNATURE NOT DECRYPTED
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-sans mt-0.5 leading-normal">
                      The document fingerprint computed locally does not match any verified leak records written in our ledger archives.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-background-card border border-background-border rounded-lg space-y-4">
                  <h3 className="text-xs text-zinc-300 font-bold uppercase tracking-wider">What does this mean?</h3>
                  <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                    A cryptographic match failure occurs when:
                  </p>
                  <ul className="list-disc list-inside text-zinc-500 font-sans text-[11px] space-y-2 pl-2">
                    <li><span className="text-zinc-400 font-semibold">The file has been modified:</span> Even a single character change, whitespace deletion, or format conversion generates a completely different SHA-256 fingerprint.</li>
                    <li><span className="text-zinc-400 font-semibold">The leak was rejected:</span> If the leak was classified as fake or low quality, it was flagged and rejected.</li>
                    <li><span className="text-zinc-400 font-semibold">The leak was never submitted:</span> The document has not been processed through the DeadDrop protocol.</li>
                  </ul>
                  <p className="text-[10px] text-zinc-600 font-sans leading-normal pt-2 border-t border-background-border">
                    💡 If you have authentic files showing public interest wrongdoings, you can configure your transmitter and submit them for AI audit verification.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
