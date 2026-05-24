"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Check, FileText, ArrowRight, Eye } from 'lucide-react';

interface SecurityChecklistProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function SecurityChecklist({
  forceOpen = false,
  onClose
}: SecurityChecklistProps) {
  const { securityChecklistCompleted, setChecklistCompleted, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

  // Individual checkbox states
  const [torVpn, setTorVpn] = useState(false);
  const [metadata, setMetadata] = useState(false);
  const [publicDevice, setPublicDevice] = useState(false);
  const [disclaimer, setDisclaimer] = useState(false);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  if (!mounted) return null;

  // If already completed and we are not forcing it open, don't show
  const showModal = forceOpen || !securityChecklistCompleted;
  if (!showModal) return null;

  const allChecked = torVpn && metadata && publicDevice && disclaimer;

  const handleConfirm = () => {
    if (allChecked) {
      setChecklistCompleted(true);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
      <div className="w-full max-w-lg bg-background-card border border-primary/30 rounded-lg p-6 shadow-red-glow font-mono text-xs relative overflow-hidden">
        {/* Glow grid lines */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-cyber" />

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded bg-primary/10 text-primary">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-fafafa">
              🚨 SOURCE DECLASSIFICATION SAFETY PROTOCOL
            </h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">MANDATORY OPSEC VERIFICATION</p>
          </div>
        </div>

        <p className="text-zinc-400 font-sans leading-relaxed text-[11px] mb-5">
          Whistleblowing carries massive legal, personal, and career risks. 
          You must verify that your local transmission station is properly anonymized before submiting claims to the GenLayer blockchain.
        </p>

        {/* Checklist */}
        <div className="space-y-3.5 mb-6">
          {/* VPN/Tor */}
          <label className="flex items-start gap-3 p-3 bg-background border border-background-border rounded cursor-pointer hover:border-zinc-700 transition-all select-none">
            <input
              type="checkbox"
              checked={torVpn}
              onChange={(e) => setTorVpn(e.target.checked)}
              className="mt-1 accent-primary h-4 w-4 rounded bg-background border border-background-border shrink-0 cursor-pointer"
            />
            <div>
              <span className="font-bold text-zinc-200 block text-[11px] uppercase tracking-wider">01 CONNECTION SECURED</span>
              <span className="text-zinc-500 text-[10px] font-sans leading-normal block mt-0.5">
                I am using the **Tor Browser** (recommended) or a premium no-logs VPN to mask my real-world IP address.
              </span>
            </div>
          </label>

          {/* Metadata */}
          <label className="flex items-start gap-3 p-3 bg-background border border-background-border rounded cursor-pointer hover:border-zinc-700 transition-all select-none">
            <input
              type="checkbox"
              checked={metadata}
              onChange={(e) => setMetadata(e.target.checked)}
              className="mt-1 accent-primary h-4 w-4 rounded bg-background border border-background-border shrink-0 cursor-pointer"
            />
            <div>
              <span className="font-bold text-zinc-200 block text-[11px] uppercase tracking-wider">02 METADATA REMOVED</span>
              <span className="text-zinc-500 text-[10px] font-sans leading-normal block mt-0.5">
                I have stripped all EXIF tags, GPS coordinate markers, author history, and device serial indices from my files using tools like `exiftool` or `mat2`.
              </span>
            </div>
          </label>

          {/* Public Device */}
          <label className="flex items-start gap-3 p-3 bg-background border border-background-border rounded cursor-pointer hover:border-zinc-700 transition-all select-none">
            <input
              type="checkbox"
              checked={publicDevice}
              onChange={(e) => setPublicDevice(e.target.checked)}
              className="mt-1 accent-primary h-4 w-4 rounded bg-background border border-background-border shrink-0 cursor-pointer"
            />
            <div>
              <span className="font-bold text-zinc-200 block text-[11px] uppercase tracking-wider">03 HARDWARE ANONYMIZED</span>
              <span className="text-zinc-500 text-[10px] font-sans leading-normal block mt-0.5">
                I am submitting from a public network (e.g. library, cafe) on a non-personal device to avoid network triangulation or physical trace correlations.
              </span>
            </div>
          </label>

          {/* Legal Limits */}
          <label className="flex items-start gap-3 p-3 bg-background border border-background-border rounded cursor-pointer hover:border-zinc-700 transition-all select-none">
            <input
              type="checkbox"
              checked={disclaimer}
              onChange={(e) => setDisclaimer(e.target.checked)}
              className="mt-1 accent-primary h-4 w-4 rounded bg-background border border-background-border shrink-0 cursor-pointer"
            />
            <div>
              <span className="font-bold text-zinc-200 block text-[11px] uppercase tracking-wider">04 PLATFORM DISCLOSURE AGREEMENT</span>
              <span className="text-zinc-500 text-[10px] font-sans leading-normal block mt-0.5">
                I understand DeadDrop is a decentralized platform. While my data is encrypted and ledger coordinates are anonymized, the platform cannot protect me from physical tailing or offline breaches.
              </span>
            </div>
          </label>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-background-border pt-4">
          <a
            href="/docs/security.md"
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-background-border hover:border-cyber text-zinc-400 hover:text-cyber transition-all rounded text-center"
          >
            <FileText className="w-3.5 h-3.5" />
            Full OPSEC Guide
          </a>

          <button
            onClick={handleConfirm}
            disabled={!allChecked}
            className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded font-bold uppercase tracking-widest text-[11px] transition-all ${
              allChecked 
                ? 'bg-primary border border-primary text-white hover:bg-primary/95 cursor-pointer shadow-red-glow' 
                : 'bg-background-elevated border border-background-border text-zinc-600 cursor-not-allowed'
            }`}
          >
            Enter Platform
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
