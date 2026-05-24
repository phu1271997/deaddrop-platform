"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Fingerprint, Flame, Wallet, Key, RefreshCw, AlertTriangle } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

export default function AnonymousModeToggle() {
  const {
    isAnonymousMode,
    burnerWallet,
    metaMaskAddress,
    toggleAnonymousMode,
    generateNewBurnerWallet,
    connectMetaMask,
    disconnectMetaMask,
    initializeStore
  } = useStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  if (!mounted) {
    return (
      <div className="h-10 w-64 bg-background-border rounded animate-pulse" />
    );
  }

  const activeAddress = isAnonymousMode 
    ? burnerWallet?.address 
    : metaMaskAddress;

  return (
    <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 bg-background-card border border-background-border rounded-lg shadow-cyber-glow gap-4">
      {/* Status section */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          isAnonymousMode 
            ? 'bg-primary/10 text-primary animate-pulse-slow' 
            : 'bg-accent/10 text-accent'
        }`}>
          {isAnonymousMode ? (
            <Flame className="w-5 h-5 text-primary" />
          ) : (
            <Wallet className="w-5 h-5 text-accent" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">OPSEC STATUS</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${
              isAnonymousMode 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-accent/20 text-accent border border-accent/30'
            }`}>
              {isAnonymousMode ? "BURNER WALLET ACTIVE (ENCRYPTED)" : "METAMASK DEPLOYED (TRACKABLE)"}
            </span>
          </div>
          <p className="text-sm font-mono text-zinc-300 mt-1 select-all">
            {activeAddress ? truncateAddress(activeAddress, 10) : "No active transmitter"}
          </p>
        </div>
      </div>

      {/* Buttons / Controls section */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Mode button */}
        <button
          onClick={() => {
            if (isAnonymousMode) {
              connectMetaMask();
            } else {
              toggleAnonymousMode(true);
            }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
            isAnonymousMode 
              ? 'bg-primary border-primary text-white hover:bg-primary/90' 
              : 'bg-background-elevated border-background-border text-zinc-400 hover:text-white hover:bg-background-border'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          {isAnonymousMode ? "Use Burner" : "Switch to Burner"}
        </button>

        {/* MetaMask Button */}
        {!metaMaskAddress ? (
          <button
            onClick={connectMetaMask}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all bg-background-elevated border-background-border text-zinc-400 hover:text-white hover:bg-background-border`}
          >
            <Wallet className="w-4 h-4" />
            Connect MetaMask
          </button>
        ) : (
          <button
            onClick={disconnectMetaMask}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border border-accent/20 bg-accent/10 text-accent hover:bg-accent/20 transition-all`}
          >
            Disconnect MetaMask
          </button>
        )}

        {/* Burner rotation button */}
        {isAnonymousMode && (
          <button
            onClick={() => {
              if (confirm("Generating a new burner will discard the current one. Are you sure?")) {
                generateNewBurnerWallet();
              }
            }}
            title="Rotate keys"
            className="p-2 rounded bg-background-elevated border border-background-border text-zinc-500 hover:text-white hover:bg-background-border transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
