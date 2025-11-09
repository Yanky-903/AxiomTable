// src/types/token.ts
export type TokenStatus = 'new' | 'final-stretch' | 'migrated';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  pair: string; // e.g. "TKN/USDC"
  price: number;
  change24h: number;
  volume24h: number;
  status: TokenStatus;
  liquidity: number;
  logo?: string;
};
