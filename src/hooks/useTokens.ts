// src/hooks/useTokens.ts
import { useEffect } from 'react';
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { fetchTokens } from '../lib/api'; // must return Promise<Token[]>
import { createWSMock, type PriceUpdate } from '../lib/wsMock';
import type { Token } from '../types/token';

/**
 * useTokens
 * - Fetch tokens via React Query (Token[])
 * - Start a mock WS that updates prices and patches the cache
 * - Return the full UseQueryResult so callers can read data/isLoading/isError/refetch
 */
export function useTokens(): UseQueryResult<Token[], Error> {
  const qc = useQueryClient();

  // Note: we removed `cacheTime` because the v5 types don't accept it here.
  const query = useQuery({
    queryKey: ['tokens'],
    queryFn: fetchTokens as () => Promise<Token[]>,
    staleTime: 5_000, // keeps data fresh for a short time
    retry: 1,

    // onSuccess typed explicitly
    onSuccess: (tokens: Token[]) => {
      if (!tokens) return;
      qc.setQueryData(['tokens', 'byId'], tokens.reduce<Record<string, Token>>((acc, t: Token) => {
        acc[t.id] = t;
        return acc;
      }, {}));
    },
  });

  useEffect(() => {
    if (!query.data || query.data.length === 0) return;

    let ws: ReturnType<typeof createWSMock> | null = null;
    try {
      ws = createWSMock(query.data);
    } catch {
      ws = null;
    }

    const applyUpdate = (upd: PriceUpdate) => {
      qc.setQueryData<Token[]>(['tokens'], (current) => {
        if (!current) return [];
        return current.map((t: Token) =>
          t.id === upd.id
            ? { ...t, price: upd.price, change24h: upd.change24h, volume24h: upd.volume24h }
            : t
        );
      });
    };

    if (ws && typeof ws.on === 'function') {
      const unsub = ws.on('price', (p: PriceUpdate) => applyUpdate(p));
      return () => {
        if (typeof unsub === 'function') unsub();
        if (typeof ws?.close === 'function') ws.close();
        ws = null;
      };
    }

    // fallback interval-based updater
    const interval = setInterval(() => {
      const current = qc.getQueryData<Token[]>(['tokens']);
      if (!current || current.length === 0) return;

      const i = Math.floor(Math.random() * current.length);
      const t = current[i];
      if (!t) return;

      const delta = (Math.random() - 0.5) * (t.price * 0.02);
      const newPrice = Math.max(0.000001, Number((t.price + delta).toFixed(6)));
      const newChange = Number((t.change24h + (delta / Math.max(1, t.price)) * 100).toFixed(2));
      const newVol = Math.max(0, Math.round(t.volume24h * (1 + (Math.random() - 0.5) * 0.06)));

      applyUpdate({ id: t.id, price: newPrice, change24h: newChange, volume24h: newVol });
    }, 1000);

    return () => clearInterval(interval);
  }, [qc, query.data]);

  return query;
}
