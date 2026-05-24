import CryptoJS from 'crypto-js';

/**
 * Computes the SHA-256 hash of a file completely client-side in the browser.
 * This ensures the document itself is never uploaded to any server.
 */
export async function hashDocument(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates a persistent, pseudonymous identity for reputation tracking.
 * - privkey: a 256-bit random private key seed (hex encoded)
 * - pubkey: SHA-256 hash of the privkey (used on-chain as submitter_pubkey)
 */
export function generatePseudonymousIdentity(): { pubkey: string; privkey: string } {
  // Generate 32 bytes of cryptographically secure random entropy
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  
  // Convert to hex string
  const privkey = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // pubkey is the SHA-256 hash of the private key
  const pubkey = CryptoJS.SHA256(privkey).toString(CryptoJS.enc.Hex);
  
  return { pubkey, privkey };
}

/**
 * Generates the commit hash for the bounty claim:
 * commit_hash = sha256(seed_hex + recipient_address)
 */
export function generateCommitHash(seedHex: string, recipientAddress: string): string {
  // Enforce lowercase addresses for hashing consistency
  const data = seedHex + recipientAddress.toLowerCase();
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}
