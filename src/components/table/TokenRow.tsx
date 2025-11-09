// src/components/table/TokenRow.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Token } from '../../types/token';
import clsx from 'clsx';
import { useAppDispatch } from '../../store';
import { selectToken, openDetailsModal } from '../../store/tokensSlice';
import * as Tooltip from '@radix-ui/react-tooltip';

function formatPrice(p: number) {
  return p >= 1 ? p.toFixed(4) : p.toFixed(6);
}
function formatPercent(v: number) {
  return `${v.toFixed(2)}%`;
}

export default React.memo(function TokenRow({ token }: { token: Token }) {
  const prevPriceRef = useRef<number | null>(null);
  const [flash, setFlash] = useState<null | 'up' | 'down'>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (prevPriceRef.current == null) {
      prevPriceRef.current = token.price;
      return;
    }
    const prev = prevPriceRef.current;
    if (token.price > prev) setFlash('up');
    else if (token.price < prev) setFlash('down');
    const t = setTimeout(() => setFlash(null), 650);
    prevPriceRef.current = token.price;
    return () => clearTimeout(t);
  }, [token.price]);

  const openForToken = useCallback(() => {
    dispatch(selectToken(token.id));
    dispatch(openDetailsModal());
  }, [dispatch, token.id]);

  function handleOpenModalFromButton(e: React.MouseEvent) {
    e.stopPropagation();
    openForToken();
  }

  const tooltipId = `token-tooltip-${token.id}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openForToken}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openForToken();
        }
      }}
      className={clsx(
        'table-row',
        flash === 'up' && 'price-flash-up',
        flash === 'down' && 'price-flash-down',
        'cursor-pointer'
      )}
    >
      <div className="w-10 flex-none">
        <div className="token-avatar" aria-hidden>
          {token.symbol.slice(0, 2)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Tooltip.Provider>
          <Tooltip.Root delayDuration={120}>
            <Tooltip.Trigger asChild>
              <div className="text-sm font-medium truncate" aria-describedby={tooltipId}>
                {token.symbol}
                <span className="text-xs text-slate-500 ml-2">{token.name}</span>
              </div>
            </Tooltip.Trigger>

            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                align="center"
                className="tooltip"
                sideOffset={6}
              >
                <div id={tooltipId}>
                  <div className="font-medium text-sm">{token.symbol} · {token.pair}</div>
                  <div className="text-xs text-slate-200 mt-1">Liquidity: {Intl.NumberFormat().format(token.liquidity)}</div>
                </div>
                <Tooltip.Arrow className="tooltip-arrow" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <div className="text-xs text-slate-400">{token.pair}</div>
      </div>

      <div className="w-28 text-right font-mono">
        <div className={clsx('transition-colors', token.change24h >= 0 ? 'price-up' : 'price-down')}>
          ${formatPrice(token.price)}
        </div>
        <div className="text-xs text-slate-500">Vol {Intl.NumberFormat().format(token.volume24h)}</div>
      </div>

      <div className="w-24 text-right">
        <div className={clsx('text-sm', token.change24h >= 0 ? 'price-up' : 'price-down')}>
          {formatPercent(token.change24h)}
        </div>
      </div>

      <div className="w-20 text-right">
        <button
          type="button"
          aria-label={`Open details for ${token.symbol}`}
          onClick={handleOpenModalFromButton}
          className="token-trade-btn"
        >
          Trade
        </button>
      </div>
    </div>
  );
});
