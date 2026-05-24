"use client";

import React, { useState, useRef } from 'react';
import { hashDocument } from '@/lib/crypto-utils';
import { UploadCloud, Link as LinkIcon, Plus, X, FileText, CheckCircle, Shield } from 'lucide-react';

interface EvidenceUploaderProps {
  onDocumentHashCalculated: (hash: string) => void;
  onUrlsChanged: (urls: string[]) => void;
}

export default function EvidenceUploader({
  onDocumentHashCalculated,
  onUrlsChanged
}: EvidenceUploaderProps) {
  // File states
  const [file, setFile] = useState<File | null>(null);
  const [docHash, setDocHash] = useState<string>("");
  const [isCalculatingHash, setIsCalculatingHash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL states
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");

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
    setIsCalculatingHash(true);
    try {
      const hash = await hashDocument(selectedFile);
      setDocHash(hash);
      onDocumentHashCalculated(hash);
    } catch (e) {
      console.error("Hash calculation failed", e);
      alert("Error calculating document hash. Please try again.");
    } finally {
      setIsCalculatingHash(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setDocHash("");
    onDocumentHashCalculated("");
  };

  const addUrl = () => {
    if (!currentUrl) return;
    if (urls.length >= 5) {
      alert("Maximum 5 evidence URLs allowed.");
      return;
    }
    // Simple URL validation
    if (!currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
      alert("Evidence URL must start with http:// or https://");
      return;
    }
    const updated = [...urls, currentUrl];
    setUrls(updated);
    onUrlsChanged(updated);
    setCurrentUrl("");
  };

  const removeUrl = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    onUrlsChanged(updated);
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Client-side File Hash Section */}
      <div className="p-4 bg-background-card border border-background-border rounded-lg">
        <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold mb-2 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-cyber" />
          LOCAL CRYPTOGRAPHIC LEDGER PROOF
        </h3>
        <p className="text-[11px] text-zinc-500 mb-3">
          Drag and drop your leak document below. The SHA-256 fingerprint will be computed locally in your browser sandbox. 
          <span className="text-primary font-semibold"> The document is never transmitted to our servers or the blockchain.</span> Only the proof hash is stored.
        </p>

        {/* Drop zone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-background-border hover:border-cyber/50 bg-background hover:bg-zinc-950/20 p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-zinc-500" />
            <p className="text-zinc-400 text-center font-sans">
              Drag file here or <span className="text-cyber underline cursor-pointer">browse local drive</span>
            </p>
            <p className="text-[10px] text-zinc-600">Supports PDF, CSV, TXT, DOCX, ZIP (Max 100MB)</p>
          </div>
        ) : (
          <div className="p-3.5 bg-background border border-cyber/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden mr-2">
              <FileText className="w-7 h-7 text-cyber shrink-0" />
              <div className="overflow-hidden">
                <p className="text-zinc-300 font-sans font-semibold text-sm truncate">{file.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB | Format: {file.type || 'unknown'}
                </p>
                {docHash && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[9px] uppercase font-bold text-success bg-success/15 px-1.5 py-0.5 rounded border border-success/25 flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-2.5 h-2.5" />
                      SHA-256 SECURED
                    </span>
                    <span className="text-[10px] text-cyber font-mono select-all overflow-hidden text-ellipsis whitespace-nowrap block max-w-[120px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
                      {docHash}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1.5 rounded hover:bg-background-border text-zinc-500 hover:text-white transition-all"
              title="Delete local file reference"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCalculatingHash && (
          <div className="mt-3 flex items-center justify-center gap-2 text-cyber animate-pulse">
            <div className="w-3 h-3 rounded-full bg-cyber animate-ping" />
            <span>GENERATE LOCAL CRYPTOGRAPHIC PROOF HASH...</span>
          </div>
        )}
      </div>

      {/* Online Evidence URLs Section */}
      <div className="p-4 bg-background-card border border-background-border rounded-lg">
        <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold mb-2 flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-accent" />
          ONLINE EVIDENCE AND CROSS-REFERENCES
        </h3>
        <p className="text-[11px] text-zinc-500 mb-3">
          Add public evidence URLs (SEC Filings, court registries, news archives, corporate data catalogs, IPFS paths). 
          The AI Gatekeeper will render these pages to verify the claims on-chain. Max 5 URLs.
        </p>

        {/* Input area */}
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            placeholder="https://example.com/evidence-document"
            className="flex-1 bg-background border border-background-border focus:border-accent rounded px-3 py-2 text-xs font-mono text-zinc-300 outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button
            onClick={addUrl}
            type="button"
            className="px-3 py-2 bg-background-border hover:bg-accent hover:text-black border border-background-border hover:border-accent text-zinc-300 rounded transition-all flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* List of URLs */}
        {urls.length > 0 ? (
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-background border border-background-border rounded"
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <span className="text-[10px] text-zinc-600 font-bold shrink-0">0{index + 1}</span>
                  <span className="text-zinc-300 truncate font-mono select-all text-[11px]">
                    {url}
                  </span>
                </div>
                <button
                  onClick={() => removeUrl(index)}
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-background-border transition-all shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-600 text-center py-4 border border-dashed border-background-border rounded-lg font-sans">
            No public evidence URLs added. (Highly recommended to add at least 1 URL to assist the AI auditor)
          </p>
        )}
      </div>
    </div>
  );
}
