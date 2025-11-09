// src/lib/wsMock.ts
import type { Token } from '../types/token';

/**
 * PriceUpdate: the payload emitted by the WS mock.
 * - id, price, timestamp are present always
 * - change24h and volume24h are included so consumers (UI) can show delta and volume
 */
export type PriceUpdate = {
  id: string;
  price: number;
  timestamp: number;
  change24h: number;   // percent change over 24h (mocked)
  volume24h: number;   // 24h volume (mocked)
};

type PriceListener = (u: PriceUpdate) => void;

export function createWSMock(tokens: Token[], opts?: { intervalMs?: number }) {
  const intervalMs = opts?.intervalMs ?? 900;

  // simple event emitter implementation for 'price' events
  const listeners = new Set<PriceListener>();

  function subscribe(cb: PriceListener) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  // convenience .on/.off API (Node-style)
  function on(event: 'price', cb: PriceListener) {
    if (event !== 'price') return () => {};
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
  function off(event: 'price', cb: PriceListener) {
    if (event !== 'price') return;
    listeners.delete(cb);
  }

  // allow close() to stop the mock (friendly API)
  let handle: ReturnType<typeof setInterval> | null = null;

  // maintain last emitted price and a mocked 24h change & volume for plausibility
  const priceMap = new Map<string, number>();
  const baseVolumeMap = new Map<string, number>(); // base 24h volume per token
  const baseChangeMap = new Map<string, number>(); // base 24h change per token

  tokens.forEach((t) => {
    priceMap.set(t.id, t.price);
    // if token.volume24h exists use it, otherwise seed a random base volume
    baseVolumeMap.set(t.id, (t as any).volume24h ?? Math.max(1000, Math.round(t.price * 1000)));
    // seed a plausible change24h (random small value)
    baseChangeMap.set(t.id, (t as any).change24h ?? Number((Math.random() * 6 - 3).toFixed(2)));
  });

  function emitUpdate(u: PriceUpdate) {
    // iterate listeners copy to avoid mutation issues
    Array.from(listeners).forEach((cb) => {
      try {
        cb(u);
      } catch (err) {
        // swallow listener errors to keep mock running
        // eslint-disable-next-line no-console
        console.error('wsMock listener error', err);
      }
    });
  }

  function start() {
    if (handle) return;
    handle = setInterval(() => {
      // choose 1..max tokens to update this tick
      const maxEmit = Math.max(1, Math.floor(tokens.length * 0.03)); // ~3% of tokens
      const emitCount = 1 + Math.floor(Math.random() * maxEmit);

      for (let i = 0; i < emitCount; i++) {
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        const current = priceMap.get(token.id) ?? token.price;

        // random delta: +/- up to 2%
        const pct = (Math.random() - 0.5) * 0.04;
        const newPrice = Number((Math.max(0.000001, current * (1 + pct))).toFixed(6));
        priceMap.set(token.id, newPrice);

        // mock change24h: baseChange + small drift based on delta
        const baseChange = baseChangeMap.get(token.id) ?? 0;
        // approximate percent change contribution from this delta
        const deltaPercent = Number(((newPrice - current) / Math.max(1, current) * 100).toFixed(4));
        const newChange24h = Number((baseChange + deltaPercent * (Math.random() * 0.5)).toFixed(2));

        // mock volume: baseVolume +/- a jitter, and some relation to pct
        const baseVol = baseVolumeMap.get(token.id) ?? 1000;
        const volJitter = Math.max(0, Math.round(baseVol * (0.02 * Math.random()))); // up to 2% jitter
        const newVol = Math.max(0, Math.round(baseVol + volJitter + Math.abs(deltaPercent) * 50));

        const payload: PriceUpdate = {
          id: token.id,
          price: newPrice,
          timestamp: Date.now(),
          change24h: newChange24h,
          volume24h: newVol,
        };

        emitUpdate(payload);
      }
    }, intervalMs);
  }

  function stop() {
    if (handle) {
      clearInterval(handle);
      handle = null;
    }
  }

  // start immediately
  start();

  return {
    // legacy subscribe API (returns unsubscribe)
    subscribe,
    // Node-style on/off
    on,
    off,
    // close/stop alias
    close: stop,
    stop,
    _internal: { priceMap, baseVolumeMap, baseChangeMap },
  };
}
