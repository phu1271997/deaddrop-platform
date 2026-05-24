"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Copy, Check, Eye, EyeOff, Flame, Trash2 } from 'lucide-react';

export default function BurnerWalletGenerator() {
  const { burnerWallet, generateNewBurnerWallet, isAnonymousMode, initializeStore } = useStore();
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  if (!mounted) return null;
  if (!isAnonymousMode || !burnerWallet) return null;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full p-5 bg-zinc-950 border border-primary/20 rounded-lg relative overflow-hidden">
      {/* Flame decorative background */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 text-primary/[0.03] pointer-events-none">
        <Flame className="w-full h-full" />
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded bg-primary/10 text-primary mt-1">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-300 font-semibold flex items-center gap-2">
            EPHEMERAL TRANSMITTER CREDENTIALS
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            DeadDrop has generated a secure, temporary single-use cryptographic wallet inside this browser sandbox. 
            All submissions will originate from this address. Save these details now; they are permanently purged if you clear history.
          </p>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {/* Wallet Address */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-background border border-background-border rounded gap-2">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Transmitter Address</span>
          <div className="flex items-center gap-2 max-w-full">
            <span className="text-zinc-300 select-all overflow-hidden text-ellipsis whitespace-nowrap block max-w-[200px] sm:max-w-xs md:max-w-md">
              {burnerWallet.address}
            </span>
            <button
              onClick={() => copyToClipboard(burnerWallet.address, setCopiedAddress)}
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-background-border transition-all"
              title="Copy Address"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Private Key */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-background border border-background-border rounded gap-2">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            Signing Key
          </span>
          <div className="flex items-center gap-2 max-w-full">
            <span className={`text-cyber select-all overflow-hidden text-ellipsis whitespace-nowrap block max-w-[180px] sm:max-w-xs md:max-w-md transition-all ${
              showKey ? 'blur-0 font-normal' : 'blur-[5px] select-none font-bold'
            }`}>
              {burnerWallet.privateKey}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-background-border transition-all"
                title={showKey ? "Hide Private Key" : "Show Private Key"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => copyToClipboard(burnerWallet.privateKey, setCopiedKey)}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-background-border transition-all"
                title="Copy Private Key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mnemonic Seed Phrase */}
        {burnerWallet.mnemonic && (
          <div className="flex flex-col p-2.5 bg-background border border-background-border rounded gap-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Recovery Mnemonic</span>
              <button
                onClick={() => copyToClipboard(burnerWallet.mnemonic || '', setCopiedMnemonic)}
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-background-border text-zinc-500 hover:text-white transition-all"
              >
                {copiedMnemonic ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                Copy Phrase
              </button>
            </div>
            <p className="text-zinc-400 leading-relaxed tracking-wide bg-background-elevated/40 p-2 rounded text-[11px]">
              {burnerWallet.mnemonic}
            </p>
          </div>
        )}
      </div>

      {/* Burner rotation control */}
      <div className="mt-4 pt-4 border-t border-background-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
          ⚠️ Discarding this wallet loses access to any un-claimed bounties!
        </span>
        <button
          onClick={() => {
            if (confirm("DANGER: This action deletes your current burner wallet. If you have verified leaks pending bounty claims on this wallet, they will be lost forever. Continue?")) {
              generateNewBurnerWallet();
            }
          }}
          className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-primary hover:text-primary-glow font-bold border border-primary/20 hover:border-primary/50 px-2.5 py-1 rounded transition-all bg-primary/5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Purge & Rotate Transmitter
        </button>
      </div>
    </div>
  );
}
