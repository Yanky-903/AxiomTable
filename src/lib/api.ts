// src/lib/api.ts
import { Token } from '../types/token';
import { nanoid } from 'nanoid';

/**
 * Generate a deterministic-ish mock token list.
 * Simulates network latency to demonstrate skeletons/loading UI.
 */
function generateMockTokens(count = 80): Token[] {
  const statuses: Token['status'][] = ['new', 'final-stretch', 'migrated'];
  return Array.from({ length: count }).map((_, i) => {
    const base = 1 + Math.random() * 20;
    const price = Number((base * (1 + (Math.random() - 0.5) * 0.12)).toFixed(6));
    return {
      id: nanoid(),
      symbol: `TKN${i + 1}`,
      name: `Token ${i + 1}`,
      pair: `TKN${i + 1}/USDC`,
      price,
      change24h: Number(((Math.random() - 0.5) * 40).toFixed(2)),
      volume24h: Math.floor(Math.random() * 1000000),
      status: statuses[i % statuses.length],
      liquidity: Math.floor(Math.random() * 5_000_000),
      logo: undefined,
    };
  });
}

/**
 * Simulate an async fetch for tokens.
 * In real app, replace with fetch('/api/tokens') etc.
 */
export async function fetchTokens(): Promise<Token[]> {
  // simulate 350-900ms latency
  const delay = 350 + Math.floor(Math.random() * 550);
  await new Promise((r) => setTimeout(r, delay));
  return generateMockTokens(80);
}
