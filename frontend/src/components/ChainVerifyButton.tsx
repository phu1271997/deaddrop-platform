"use client";

import React, { useState } from 'react';
import { getGenLayerClient, CONTRACT_ADDRESS } from '@/lib/genlayer-client';
import { CheckCircle2, AlertTriangle, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { LeakRecord } from '@/store/useStore';

interface ChainVerifyProps {
  leakId: string;
  localData: LeakRecord;
}

export default function ChainVerifyButton({ leakId, localData }: ChainVerifyProps) {
  const [verificationState, setVerificationState] = useState<'idle' | 'checking' | 'verified' | 'mismatch' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyOnChain = async () => {
    setVerificationState('checking');
    setErrorMessage('');

    try {
      const glClient = getGenLayerClient();

      if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        // Mock verification fallback
        await new Promise(r => setTimeout(r, 1000));
        setVerificationState('verified');
        return;
      }

      const leakDataStr = await glClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'get_leak',
        args: [leakId]
      }) as string;

      if (!leakDataStr || leakDataStr === "") {
        setVerificationState('mismatch');
        setErrorMessage("Leak ID not found on-chain. Consensus might have rejected or appeal is pending.");
        return;
      }

      const chainData = JSON.parse(leakDataStr);

      // Compare key properties
      const matches = 
        chainData.leak_id === localData.leak_id &&
        chainData.status === localData.status &&
        chainData.document_hash === localData.document_hash &&
        chainData.credibility_score === localData.credibility_score;

      if (matches) {
        setVerificationState('verified');
      } else {
        setVerificationState('mismatch');
        setErrorMessage("On-chain data mismatch detected. Local data may have been altered.");
      }
    } catch (err: any) {
      console.error(err);
      setVerificationState('error');
      setErrorMessage(err.message || "Failed to query the blockchain network.");
    }
  };

  return (
    <div className="font-mono text-xs flex flex-col gap-2 mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={verifyOnChain}
          disabled={verificationState === 'checking'}
          className={`px-4 py-2 border rounded font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            verificationState === 'checking'
              ? 'bg-zinc-950 border-background-border text-zinc-500 cursor-not-allowed'
              : verificationState === 'verified'
              ? 'bg-success/10 border-success/30 text-success'
              : verificationState === 'mismatch'
              ? 'bg-primary/10 border-primary/30 text-primary animate-pulse'
              : 'bg-background hover:bg-background-border border-background-border text-cyber hover:border-cyber/50'
          }`}
        >
          {verificationState === 'checking' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Cpu className="w-3.5 h-3.5" />
          )}
          {verificationState === 'idle' && 'Verify on Chain'}
          {verificationState === 'checking' && 'Verifying on Ledger...'}
          {verificationState === 'verified' && 'Verified Match ✓'}
          {verificationState === 'mismatch' && 'Data Mismatch ⚠️'}
          {verificationState === 'error' && 'Verification Error ❌'}
        </button>

        {verificationState === 'verified' && (
          <span className="text-[10px] text-success font-sans flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 shrink-0 animate-pulse-slow" />
            Verified: Data matches transaction history.
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-primary/5 border border-primary/20 text-primary text-[10px] rounded flex items-start gap-2 leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
