"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Shield, Fingerprint, Flame, Info, Search, Award } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const { isAnonymousMode, burnerWallet, metaMaskAddress, stats, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeStore();
    setMounted(true);
  }, [initializeStore]);

  const navItems = [
    { name: 'SUBMIT LEAK', path: '/submit' },
    { name: 'ARCHIVE', path: '/leaks' },
    { name: 'BOUNTIES', path: '/bounty' },
    { name: 'VERIFY HASH', path: '/verify' },
  ];

  if (!mounted) {
    return (
      <header className="w-full border-b border-background-border bg-black/80 h-16 animate-pulse" />
    );
  }

  const activeAddress = isAnonymousMode ? burnerWallet?.address : metaMaskAddress;

  return (
    <header className="w-full border-b border-background-border bg-black/80 backdrop-blur-md sticky top-0 z-40 font-mono text-xs">
      {/* Live Ticker banner at the very top */}
      <div className="w-full py-1.5 bg-zinc-950 border-b border-background-border overflow-hidden select-none">
        <div className="flex justify-center whitespace-nowrap animate-pulse-slow">
          <span className="text-[10px] tracking-widest text-zinc-500 font-bold uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            LIVE TICKER: {stats.total_leaks_submitted} AUDITED • {stats.total_leaks_verified} VERIFIED ON-CHAIN • {(parseFloat(stats.total_bounty_pool) / 1e18).toFixed(1)} GEN ACTIVE BOUNTY POOL
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-5 h-5 text-primary group-hover:rotate-12 transition-all" />
          <span className="font-serif italic text-xl tracking-wider text-fafafa group-hover:text-primary transition-all">
            DeadDrop
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`font-semibold tracking-widest transition-all ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* OPSEC Wallet Indicator / Status */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">TRANSMISSION CHANNEL</span>
            <span className={`text-[10px] font-bold ${isAnonymousMode ? 'text-primary' : 'text-accent'}`}>
              {isAnonymousMode ? 'ANONYMOUS BURNER' : 'TRACKED METAMASK'}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 bg-background-elevated border border-background-border rounded text-[11px] ${
            isAnonymousMode ? 'border-primary/25 bg-primary/[0.02]' : 'border-accent/25 bg-accent/[0.02]'
          }`}>
            {isAnonymousMode ? (
              <Flame className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse-slow" />
            ) : (
              <Fingerprint className="w-3.5 h-3.5 text-accent shrink-0" />
            )}
            <span className="text-zinc-300 font-semibold select-all">
              {activeAddress ? truncateAddress(activeAddress, 4) : 'SECURE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
