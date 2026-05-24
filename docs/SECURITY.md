# ⚠️ Mandatory Whistleblower OPSEC Guide

> **DISCLAIMER:** DeadDrop is a highly secure tool, but it is not a panacea. Cryptography, smart contracts, and block hashes protect your transmission logs and reward routes, but they CANNOT prevent offline failures, physical surveillance, or compromised personal devices. Real safety requires real OPSEC.

---

## 🦊 The Danger of MetaMask and Personal Wallets

Connecting a personal Web3 wallet (like MetaMask) to a whistleblower platform is an **extreme risk**:
- **Address Linkability:** If you connect a wallet funded by a centralized exchange (like Coinbase, Binance), your on-chain address is directly linked to your real-world government-issued identity (KYC).
- **IP Logging:** Traditional Web3 wallet RPC endpoints (such as Infura) log browser IP addresses, user agents, and transaction coordinates.
- **Transmitter Footprints:** Even if you use a fresh wallet, if you transfer gas to it from your personal wallet, you have created a permanent, public link on the blockchain.

**➔ RULE:** ALWAYS keep **Burner Wallet Mode** active (the default option in DeadDrop). It generates single-use keys locally in the browser sandbox. Never fund it from your personal accounts.

---

## 🧅 Tor Browser and Network Anonymity

Your home ISP (Internet Service Provider) logs every website domain you visit. Submitting leaks from your home network is a critical failure.

1. **Install Tor Browser:** Download and install the official [Tor Browser](https://www.torproject.org/). Tor routes your traffic through multiple encrypted nodes worldwide, masking your destination.
2. **Never Use Personal WiFi:** Do not use Tor from your home WiFi. Go to a high-traffic public library, cafe, or student center. 
3. **Avoid CCTV:** Sit in blind spots of surveillance cameras. Do not place your screen in view of windows.
4. **Boot TAILS OS (Advanced):** For maximum safety, flash [TAILS OS](https://tails.boum.org/) to a USB drive and boot your laptop from it. TAILS is a secure, amnesic operating system that forces all network connections through Tor and leaves zero physical traces on your hard drive.

---

## 📁 Stripping Document Metadata

Modern document formats (PDFs, Word docs, CSVs, JPGs) automatically embed hidden identifiers called **metadata**:
- Creation date, edit timestamps, and author names.
- Computer username, operating system version, and software licenses.
- Device serial numbers, printer dots, and camera GPS coordinates.

Exposing metadata instantly doxxes you. **DeadDrop only computes file hashes locally and never uploads the raw file, but if you distribute the file elsewhere, strip it first!**

### How to Strip Metadata via Terminal

#### 1. Using `MAT2` (Recommended on Linux/Mac)
MAT2 is a command-line metadata removal tool supporting PDFs, Office docs, and images:
```bash
# Install mat2 (on Mac via Homebrew)
brew install mat2

# Check metadata of a document
mat2 --show leak_evidence.pdf

# Strip all metadata (creates leak_evidence.cleaned.pdf)
mat2 leak_evidence.pdf
```

#### 2. Using `ExifTool` (Cross-platform)
```bash
# Install exiftool
brew install exiftool

# Strip all tags and rewrite file
exiftool -all= -overwrite_original leak_evidence.pdf
```

---

## 🔐 Burner Wallet & Identity Seed Management

1. **Ephemeral Keys:** When submitting, copy the generated transmitter private key. You will need it to check transaction status.
2. **Download Seed:** When prompted, download the `deaddrop_seed_*.txt` file. This is your pseudonymous private key. 
3. **USB Vault:** Move the downloaded seed and recipient details to an encrypted USB flash drive (using VeraCrypt or BitLocker). Delete the files from your local downloads folder.
4. **Purge Browser:** Once you have secured your seed and claims are finalized, go to **Purge & Rotate Transmitter** in the burner wallet section. This purges browser local storage, leaving zero clues for forensic computer auditors.
