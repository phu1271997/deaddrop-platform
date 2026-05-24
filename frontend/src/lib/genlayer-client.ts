import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

// Default mock address if none is provided, allowing graceful local development UI testing
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

/**
 * Returns a configured GenLayer Client.
 * If a burnerPrivateKey is provided, it uses it to sign transactions.
 * Otherwise, it falls back to the browser-injected provider (MetaMask).
 */
export function getGenLayerClient(burnerPrivateKey?: `0x${string}`) {
  if (burnerPrivateKey) {
    return createClient({
      chain: studionet,
      account: burnerPrivateKey,
    });
  }

  // Check if browser has MetaMask/Ethereum provider
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return createClient({
      chain: studionet,
      // The client will automatically interact with window.ethereum for signing
    });
  }

  // Read-only fallback client
  return createClient({
    chain: studionet,
  });
}
