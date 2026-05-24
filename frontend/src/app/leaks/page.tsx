"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import LeakCard from '@/components/LeakCard';
import { Search, SlidersHorizontal, BookOpen, ShieldAlert, Award } from 'lucide-react';

export default function LeaksArchive() {
  const { verifiedLeaks, fetchVerifiedLeaks, initializeStore } = useStore();
  const [mounted, setMounted] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

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

  // Filter leaks client-side for immediate responsive experience
  const filteredLeaks = verifiedLeaks.filter((leak) => {
    // 1. Search Query Match
    const matchesSearch = 
      leak.title.toLowerCase().includes(search.toLowerCase()) ||
      leak.target_entity.toLowerCase().includes(search.toLowerCase()) ||
      leak.summary.toLowerCase().includes(search.toLowerCase()) ||
      leak.leak_id.toLowerCase().includes(search.toLowerCase());

    // 2. Category Match
    const matchesCategory = selectedCategory === "all" || leak.category === selectedCategory;

    // 3. Score Threshold Match
    const matchesScore = leak.credibility_score >= minScore;

    return matchesSearch && matchesCategory && matchesScore;
  });

  // Sort leaks
  const sortedLeaks = [...filteredLeaks].sort((a, b) => {
    if (sortBy === "newest") {
      return b.submission_timestamp - a.submission_timestamp;
    } else if (sortBy === "credibility") {
      return b.credibility_score - a.credibility_score;
    } else if (sortBy === "impact") {
      // Map impact to numeric value
      const impactValues = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      const valA = impactValues[a.estimated_impact] || 0;
      const valB = impactValues[b.estimated_impact] || 0;
      return valB - valA;
    }
    return 0;
  });

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "corporate_fraud", label: "Corporate Fraud" },
    { id: "government", label: "Government" },
    { id: "environmental", label: "Environmental" },
    { id: "healthcare", label: "Healthcare" },
    { id: "tech", label: "Tech & Privacy" },
    { id: "finance", label: "Finance" }
  ];

  return (
    <div className="bg-black text-fafafa min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Header */}
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 relative z-10 flex flex-col">
        {/* Title bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-background-border pb-6 mb-8 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">ON-CHAIN DATABASE</span>
            <h1 className="text-3xl font-serif text-fafafa italic tracking-wide mt-1">
              Verified Intel Leaks Archive
            </h1>
          </div>
          <p className="text-zinc-500 text-xs font-mono max-w-md">
            ⚠️ Decrypted archives written on the GenLayer blockchain. 
            All documents have been forensic-audited by independent AI validators.
          </p>
        </div>

        {/* Dashboard Filters Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-start">
          
          {/* Left panel: Filters (1/4 width) */}
          <div className="lg:col-span-1 p-5 bg-background-card border border-background-border rounded-lg space-y-5 font-mono text-xs shadow-md">
            <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold flex items-center gap-1.5 border-b border-background-border pb-3">
              <SlidersHorizontal className="w-4 h-4 text-cyber" />
              ARCHIVE FILTERS
            </h3>

            {/* Category Selector */}
            <div className="space-y-2">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Intel Classification</span>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary/10 border border-primary/20 text-primary font-bold'
                        : 'bg-background hover:bg-background-border border border-background-border text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Credibility Score filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
                <span>Min Credibility</span>
                <span className="text-cyber font-bold">{minScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full bg-background-border accent-cyber h-1 rounded outline-none"
              />
            </div>

            {/* Sorting controls */}
            <div className="space-y-2">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">Sort Coordinates</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-background border border-background-border text-zinc-300 rounded px-3 py-2 outline-none cursor-pointer focus:border-cyber text-xs"
              >
                <option value="newest">Newest Submissions</option>
                <option value="credibility">Highest Credibility</option>
                <option value="impact">Critical Impact</option>
              </select>
            </div>
          </div>

          {/* Right panel: Search & Results Grid (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search archive: Target entity, keywords, titles, or leak IDs..."
                className="w-full pl-10 pr-4 py-3 bg-background-card border border-background-border focus:border-cyber rounded-lg text-xs font-mono text-zinc-300 outline-none shadow-md"
              />
            </div>

            {/* Results count indicator */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
              <span>SHOWING {sortedLeaks.length} OF {verifiedLeaks.length} DECANTED DATASETS</span>
              {search || selectedCategory !== "all" || minScore > 0 ? (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                    setMinScore(0);
                    setSortBy("newest");
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  CLEAR FILTERS
                </button>
              ) : null}
            </div>

            {/* Main Leaks Grid */}
            {sortedLeaks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {sortedLeaks.map((leak) => (
                  <LeakCard key={leak.leak_id} leak={leak} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-background-border bg-background-card/40 rounded-lg p-16 flex flex-col items-center justify-center text-center gap-3">
                <ShieldAlert className="w-10 h-10 text-zinc-600 animate-pulse-slow" />
                <h3 className="font-mono uppercase tracking-widest text-zinc-400 font-bold">NO VERIFIED CORRESPONDENCE</h3>
                <p className="text-zinc-600 text-xs font-sans max-w-sm leading-relaxed">
                  No leak records match your search criteria. Check your spelling or try resetting the category filter list.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
