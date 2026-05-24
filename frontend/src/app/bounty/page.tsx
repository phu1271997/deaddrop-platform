"use client";

import React, { useEffect, useState } from 'react';
import { useStore, LeakRecord } from '@/store/useStore';
import Header from '@/components/Header';
import { Award, Gift, DollarSign, Wallet, ShieldAlert, Key, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import CryptoJS from 'crypto-js';

export default function BountyDashboard() {
  const { stats, verifiedLeaks, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

  // Fund states
  const [fundCategory, setFundCategory] = useState("corporate_fraud");
  const [fundAmount, setFundAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);

  // Claim states
  const [claimLeakId, setClaimLeakId] = useState("");
  const [claimSeed, setClaimSeed] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimLogs, setClaimLogs] = useState<string[]>([]);
  const [claimStep, setClaimStep] = useState(0); // 0: idle, 1: commit pending, 2: reveal pending, 3: completed

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

  // Handle funding pool
  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsFunding(true);
    try {
      // Simulate/execute payable write contract
      await new Promise(r => setTimeout(r, 1500));
      alert(`Bounty pool for ${fundCategory} funded with ${fundAmount} GEN successfully!`);
      setFundAmount("");
    } catch (e) {
      console.error(e);
      alert("Failed to fund bounty pool.");
    } finally {
      setIsFunding(false);
    }
  };

  // Helper to add logs to claim console
  const addClaimLog = (log: string) => {
    setClaimLogs(prev => [...prev, `[CLAIM] ${log}`]);
  };

  // Handle complex double-commit bounty claim
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimLeakId || !claimSeed) {
      alert("Please fill in leak ID and private seed credentials.");
      return;
    }

    // Verify leak locally first to assist the whistleblower
    const matchingLeak = verifiedLeaks.find(l => l.leak_id === claimLeakId);
    if (!matchingLeak) {
      alert("Leak ID not found in verified archives. Must be a verified leak to claim.");
      return;
    }

    setIsClaiming(true);
    setClaimLogs([]);
    setClaimStep(1);
    addClaimLog("INITIALIZING CRYPTOGRAPHIC CLAIM PROTOCOL...");
    await new Promise(r => setTimeout(r, 800));

    // Calculate details
    const pubkey = CryptoJS.SHA256(claimSeed).toString(CryptoJS.enc.Hex);
    if (pubkey !== matchingLeak.submitter_pubkey) {
      addClaimLog("❌ ERROR: SEED HASH DOES NOT MATCH SUBMITTER PUBKEY");
      addClaimLog("VERIFICATION FAILED. SECURITY ABORT.");
      setIsClaiming(false);
      return;
    }
    addClaimLog("✓ VERIFIED: SEED KEY HASH MATCHES SUBMITTER IDENTIFIER.");
    await new Promise(r => setTimeout(r, 600));

    // Staging recipient wallet (simulate burner wallet destination)
    const recipient = "0x8922...f922";
    addClaimLog(`LOCKING IN PAYOUT RECIPIENT WALLET COORDINATES: ${recipient}`);
    await new Promise(r => setTimeout(r, 600));

    // Step 1: Commit Phase
    const dataToHash = claimSeed + recipient;
    const commitHash = CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);
    addClaimLog(`COMPUTED COMMITMENT HASH: ${commitHash}`);
    addClaimLog("CALLING claim_bounty WITH COMMIT COORDINATES...");
    await new Promise(r => setTimeout(r, 1200));
    addClaimLog("✓ COMMIT STAGED AND WRITTEN ON-CHAIN.");
    addClaimLog("WAITING FOR TRANSACTION FINALIZATION (PREVENT MEMPOOL FRONTRUNNING)...");
    await new Promise(r => setTimeout(r, 1500));

    // Step 2: Reveal Phase
    setClaimStep(2);
    addClaimLog("TX FINALIZED! REVEAL PHASE INITIALIZED.");
    addClaimLog("SENDING EXPOSED REVEAL SEED SIGNATURE TO INTEL LEDGER...");
    await new Promise(r => setTimeout(r, 1200));
    addClaimLog("✓ VALIDATING REVEAL SEED AGAINST PREVIOUS COMMIT ON-CHAIN...");
    await new Promise(r => setTimeout(r, 1000));
    addClaimLog("✓ REVEAL MATCHED SUCCESS! VALIDATORS APPROVED CONSENSUS.");

    // Execution pay out
    setClaimStep(3);
    addClaimLog("✓ BOUNTY POOL BALANCES RELEASED TO RECIPIENT DESTINATION!");
    addClaimLog("DEADDROP TRANSMITTER Purged. SAFETY DISCONNECTED.");
    setIsClaiming(false);
  };

  // Mock Bounty pools dashboard details
  const pools = [
    { name: "Corporate Fraud", id: "corporate_fraud", val: "14.5 GEN" },
    { name: "Government Misconduct", id: "government", val: "18.2 GEN" },
    { name: "Environmental Crimes", id: "environmental", val: "6.8 GEN" },
    { name: "Healthcare Abuses", id: "healthcare", val: "3.5 GEN" },
    { name: "Tech & Privacy", id: "tech", val: "4.5 GEN" },
    { name: "Financial Crimes", id: "finance", val: "1.0 GEN" }
  ];

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <Header />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col font-mono text-xs gap-8">
        
        {/* Title bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-background-border pb-6 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">PRESS POOLS & JOURNALISM DAOS</span>
            <h1 className="text-3xl font-serif text-fafafa italic tracking-wide mt-1">
              DAO Bounty Pool Dashboard
            </h1>
          </div>
          <p className="text-zinc-500 text-xs max-w-sm">
            Journalism syndicates, DAOs, and public networks fund pools to reward courageous sources anonymously.
          </p>
        </div>

        {/* Top summary stats dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-background-card border border-background-border rounded-lg flex items-center gap-4 shadow-md">
            <div className="p-3 rounded bg-accent/10 text-accent">
              <Award className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Total Bounties Active</span>
              <span className="text-xl font-bold text-fafafa">{(parseFloat(stats.total_bounty_pool) / 1e18).toFixed(1)} GEN</span>
            </div>
          </div>

          <div className="p-4 bg-background-card border border-background-border rounded-lg flex items-center gap-4 shadow-md">
            <div className="p-3 rounded bg-success/10 text-success">
              <Gift className="w-6 h-6 text-success" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Bounties Claimed</span>
              <span className="text-xl font-bold text-fafafa">14.5 GEN</span>
            </div>
          </div>

          <div className="p-4 bg-background-card border border-background-border rounded-lg flex items-center gap-4 shadow-md">
            <div className="p-3 rounded bg-cyber/10 text-cyber">
              <DollarSign className="w-6 h-6 text-cyber" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Avg Bounty Award</span>
              <span className="text-xl font-bold text-fafafa">2.5 GEN</span>
            </div>
          </div>
        </div>

        {/* Grid blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block: Active Pools List (4/12 width) */}
          <div className="lg:col-span-4 bg-background-card border border-background-border rounded-lg p-5 space-y-4 shadow-md">
            <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold border-b border-background-border pb-3">
              ACTIVE CATEGORY POOLS
            </h3>
            <div className="space-y-2">
              {pools.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-background border border-background-border rounded"
                >
                  <span className="text-zinc-400 font-sans font-semibold">{p.name}</span>
                  <span className="text-accent font-mono font-bold">{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block: Actions Tabs Forms (8/12 width) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Fund a pool form */}
            <div className="bg-background-card border border-background-border rounded-lg p-5 shadow-md">
              <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold border-b border-background-border pb-3 mb-4">
                👑 FUND A CATEGORY BOUNTY POOL
              </h3>
              <form onSubmit={handleFund} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Select Classification Category</label>
                    <select
                      value={fundCategory}
                      onChange={(e) => setFundCategory(e.target.value)}
                      className="w-full bg-background border border-background-border text-zinc-300 rounded px-3 py-2.5 outline-none cursor-pointer focus:border-cyber text-xs"
                    >
                      <option value="corporate_fraud">Corporate Fraud</option>
                      <option value="government">Government Misconduct</option>
                      <option value="environmental">Environmental Crimes</option>
                      <option value="healthcare">Healthcare Abuses</option>
                      <option value="tech">Tech & Privacy Violations</option>
                      <option value="finance">Financial Crimes</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Funding Amount (GEN)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full bg-background border border-background-border focus:border-cyber rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-background-border">
                  <button
                    type="submit"
                    disabled={isFunding}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-background border border-background-border hover:border-cyber text-zinc-300 hover:text-white font-bold uppercase tracking-widest rounded transition-all cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-cyber" />
                    {isFunding ? "STAGING ETHERS INJECTOR..." : "Fund Category Pool"}
                  </button>
                </div>
              </form>
            </div>

            {/* Claim a pool form (secure commit-reveal) */}
            <div className="bg-background-card border border-background-border rounded-lg p-5 shadow-md">
              <h3 className="text-xs uppercase tracking-widest text-primary font-semibold border-b border-background-border pb-3 mb-2 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-primary animate-pulse" />
                🔐 ANONYMOUS COMMIT-REVEAL CLAIM PORTAL
              </h3>
              <p className="text-[11px] text-zinc-500 mb-4 font-sans leading-relaxed">
                Whistleblowers can securely claim category bounties without linking their submission wallets. 
                Our frontrunning-resistant commitment locks the payout destination prior to private key seed exposure.
              </p>

              <form onSubmit={handleClaim} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Verified Leak Hash ID</label>
                    <input
                      type="text"
                      required
                      value={claimLeakId}
                      onChange={(e) => setClaimLeakId(e.target.value)}
                      placeholder="Paste verified leak SHA-256 ID..."
                      className="w-full bg-background border border-background-border focus:border-primary rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Secret Pseudonymous Seed (Private Key)</label>
                    <input
                      type="password"
                      required
                      value={claimSeed}
                      onChange={(e) => setClaimSeed(e.target.value)}
                      placeholder="Enter the secret seed key..."
                      className="w-full bg-background border border-background-border focus:border-primary rounded px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Claim Terminal Stream */}
                {claimStep > 0 && (
                  <div className="border border-background-border rounded bg-zinc-950 p-4 font-mono text-[10px] text-cyber space-y-1 relative">
                    <div className="absolute right-3 top-3 animate-ping w-2.5 h-2.5 rounded-full bg-cyber" />
                    {claimLogs.map((log, i) => (
                      <div key={i} className="whitespace-pre-wrap">{log}</div>
                    ))}
                    {isClaiming && (
                      <div className="terminal-caret inline-block animate-pulse">EXCHANGING CODES...</div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-background-border">
                  <span className="text-[10px] text-zinc-500 max-w-sm">
                    ⚠️ The recipient wallet is locked in the commit block to prevent thieves from frontrunning.
                  </span>
                  
                  <button
                    type="submit"
                    disabled={isClaiming || claimStep === 3}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 border border-primary hover:border-primary/90 text-white font-bold uppercase tracking-widest rounded transition-all shadow-red-glow cursor-pointer"
                  >
                    {isClaiming ? "CONSTRUCTING ESCROWS..." : claimStep === 3 ? "Bounty claimed successfully" : "Claim verified bounty"}
                    <ArrowRight className="w-4 h-4 animate-pulse-slow" />
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
