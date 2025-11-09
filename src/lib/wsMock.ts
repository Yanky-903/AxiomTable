// src/lib/wsMock.ts
import type { Token } from '../types/token';

export type PriceUpdate = { id: string; price: number; timestamp: number };

/**
 * createWSMock(tokens)
 * - tokens: initial tokens array (so the mock can pick ids / current price)
 * - returns an object with subscribe(cb) => unsubscribe, and stop()
 *
 * Behavior:
 * - Every interval it chooses a small subset of tokens and emits a new price (random +/- up to 2%).
 * - This is intentionally lightweight and deterministic enough for UI demo.
 */
export function createWSMock(tokens: Token[], opts?: { intervalMs?: number }) {
  const listeners = new Set<(u: PriceUpdate) => void>();
  const intervalMs = opts?.intervalMs ?? 900;

  function subscribe(cb: (u: PriceUpdate) => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  // we keep an internal price map to make changes relative to last emitted price
  const priceMap = new Map<string, number>();
  tokens.forEach((t) => priceMap.set(t.id, t.price));

  let handle = setInterval(() => {
    // choose 1-5 tokens at random
    const emitCount = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(tokens.length * 0.02)));
    for (let i = 0; i < emitCount; i++) {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const current = priceMap.get(token.id) ?? token.price;
      // random delta +/- up to 2%
      const pct = (Math.random() - 0.5) * 0.04;
      const newPrice = Number((Math.max(0.000001, current * (1 + pct))).toFixed(6));
      priceMap.set(token.id, newPrice);
      const payload: PriceUpdate = { id: token.id, price: newPrice, timestamp: Date.now() };
      listeners.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          // ignore listener errors so mock continues
          // eslint-disable-next-line no-console
          console.error('wsMock listener error', e);
        }
      });
    }
  }, intervalMs);

  return {
    subscribe,
    stop: () => clearInterval(handle),
    // allow replacing the interval (for tests)
    _internal: { priceMap },
  };
}
