"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import { Wallet, ShieldCheck, ArrowRight, TrendingDown, DollarSign } from 'lucide-react';

export default function TreasuryDashboard() {
  const { 
    initializeStore, 
    withdrawBounty, 
    getWithdrawableBalance, 
    burnerWallet, 
    metaMaskAddress, 
    isAnonymousMode 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState("0");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const activeAddress = isAnonymousMode ? burnerWallet?.address : metaMaskAddress;

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  const updateBalance = useCallback(async () => {
    if (!activeAddress) return;
    const balWei = await getWithdrawableBalance(activeAddress);
    // Convert wei to GEN
    const balEth = (parseFloat(balWei) / 1e18).toFixed(4);
    setBalance(balEth);
  }, [activeAddress, getWithdrawableBalance]);

  // Fetch balance when address becomes available
  useEffect(() => {
    if (mounted && activeAddress) {
      updateBalance();
    }
  }, [mounted, activeAddress, updateBalance]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[TREASURY] ${log}`]);
  };

  const handleWithdraw = async () => {
    if (!activeAddress || parseFloat(balance) <= 0) {
      alert("No withdrawable balance available.");
      return;
    }

    setIsWithdrawing(true);
    setLogs([]);
    addLog("INITIATING TREASURY WITHDRAWAL TRANSACTION...");
    
    try {
      const res = await withdrawBounty();
      if (res.success) {
        addLog("✓ WITHDRAWAL TRANSACTION BROADCASTED AND FINALIZED.");
        addLog(`✓ ACCRUED FUNDS OF ${balance} GEN TRANSFERRED TO EOA.`);
        setBalance("0.0000");
      } else {
        addLog(`❌ WITHDRAWAL FAILED: ${res.error}`);
      }
    } catch (err: any) {
      addLog(`❌ TRANSACTION ERROR: ${err.message || err}`);
    } finally {
      setIsWithdrawing(false);
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
      {/* Global Header */}
      <Header />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col font-mono text-xs gap-8">
        
        {/* Title bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-background-border pb-6 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">SOURCE SECURED ASSETS</span>
            <h1 className="text-3xl font-serif text-fafafa italic tracking-wide mt-1">
              Treasury & Source Withdrawals
            </h1>
          </div>
          <p className="text-zinc-500 text-xs max-w-sm">
            Withdraw earned bounties from the smart contract registry. Pull-based architecture guarantees no EOA associations during consensus execution.
          </p>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-zinc-950 border border-background-border rounded-lg space-y-2 leading-relaxed">
          <span className="text-cyber text-[10px] uppercase font-bold tracking-widest block flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            SECURE WITHDRAWAL PROTOCOL:
          </span>
          <p className="text-zinc-400 font-sans text-xs">
            DeadDrop implements a pull-based payment paradigm. When you claim a leak bounty, funds are credited to your on-chain escrow profile rather than sent directly to your EOA, avoiding frontend tracking or mempool linkability. Click withdraw below to claim your GEN.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Balance Widget (5/12 width) */}
          <div className="md:col-span-5 bg-background-card border border-background-border rounded-lg p-6 flex flex-col gap-6 shadow-md">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest block mb-1">
                Active Wallet Address
              </span>
              <span className="text-[10px] text-cyber select-all break-all">
                {activeAddress || "No wallet connected. Generate a burner or connect MetaMask."}
              </span>
            </div>

            <div className="p-4 bg-black/40 border border-background-border rounded flex items-center gap-4">
              <div className="p-3 rounded bg-cyber/10 text-cyber">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Withdrawable Balance</span>
                <span className="text-xl font-bold text-fafafa">{balance} GEN</span>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || parseFloat(balance) <= 0 || !activeAddress}
              className="w-full py-3 px-4 bg-cyber/20 hover:bg-cyber/30 border border-cyber text-cyber hover:text-white font-bold uppercase tracking-widest rounded text-center transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              {isWithdrawing ? "WITHDRAWING..." : "Execute Withdrawal"}
            </button>
          </div>

          {/* Console Output (7/12 width) */}
          <div className="md:col-span-7 bg-background-card border border-background-border rounded-lg p-5 flex flex-col gap-4 shadow-md">
            <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold border-b border-background-border pb-3">
              WITHDRAWAL CONSOLE STREAM
            </h3>
            
            {logs.length > 0 ? (
              <div className="border border-background-border rounded bg-zinc-950 p-4 font-mono text-[10px] text-cyber space-y-1 relative min-h-[140px]">
                {logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap">{log}</div>
                ))}
                {isWithdrawing && (
                  <div className="terminal-caret inline-block animate-pulse">TRANSMITTING CRYPTOGRAPHY...</div>
                )}
              </div>
            ) : (
              <div className="border border-background-border rounded bg-zinc-950/40 p-8 font-mono text-[10px] text-zinc-600 text-center italic">
                [ Console idle. Connect address and execute withdrawal to stream events. ]
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
