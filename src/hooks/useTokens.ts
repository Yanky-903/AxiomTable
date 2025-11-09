// src/hooks/useTokens.ts
import { useEffect } from 'react';
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { fetchTokens } from '../lib/api';
import { createWSMock, type PriceUpdate } from '../lib/wsMock';
import type { Token } from '../types/token';

export function useTokens(): UseQueryResult<Token[], Error> {
  const qc = useQueryClient();

  // Typed options WITHOUT onSuccess to avoid overload issues
  const options: UseQueryOptions<Token[], Error, Token[], readonly ['tokens']> = {
    queryKey: ['tokens'] as const,
    queryFn: fetchTokens as () => Promise<Token[]>,
    staleTime: 5_000,
    retry: 1,
  };

  const query = useQuery<Token[], Error, Token[], readonly ['tokens']>(options);

  // When data arrives, build a byId index in cache (separate effect avoids useQuery overload issues)
  useEffect(() => {
    if (!query.data) return;
    const tokens = query.data;
    qc.setQueryData(['tokens', 'byId'], tokens.reduce<Record<string, Token>>((acc, t: Token) => {
      acc[t.id] = t;
      return acc;
    }, {}));
  }, [qc, query.data]);

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
            ? {
                ...t,
                price: typeof upd.price === 'number' ? upd.price : t.price,
                change24h: typeof (upd as any).change24h === 'number' ? (upd as any).change24h : t.change24h,
                volume24h: typeof (upd as any).volume24h === 'number' ? (upd as any).volume24h : t.volume24h,
              }
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

    // Fallback interval-based updater (includes timestamp & other fields)
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

      const upd: PriceUpdate = {
        id: t.id,
        price: newPrice,
        timestamp: Date.now(),
        change24h: newChange,
        volume24h: newVol,
      };

      applyUpdate(upd);
    }, 1000);

    return () => clearInterval(interval);
  }, [qc, query.data]);

  return query;
}
