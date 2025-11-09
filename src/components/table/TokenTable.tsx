// src/components/table/TokenTable.tsx
'use client';

import React, { useMemo, useRef, useState } from 'react';
import TokenRow from './TokenRow';
import TokenTableSkeleton from './TokenTableSkeleton';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppSelector, useAppDispatch } from '../../store';
import { setSort } from '../../store/tokensSlice';
import clsx from 'clsx';
import { useTokens } from '../../hooks/useTokens';

type TabKey = 'all' | 'new' | 'final-stretch' | 'migrated';

const TAB_LABELS: Record<TabKey, string> = {
  all: 'All',
  new: 'New pairs',
  'final-stretch': 'Final Stretch',
  migrated: 'Migrated',
};

export default function TokenTable() {
  const { data: tokens, isLoading, isError, refetch } = useTokens();
  const dispatch = useAppDispatch();
  const { sortKey, sortDirection } = useAppSelector((s) => s.tokensUI);

  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filtered = useMemo(() => {
    if (!tokens) return [];
    if (activeTab === 'all') return tokens;
    return tokens.filter((t) => t.status === activeTab);
  }, [tokens, activeTab]);

  const sortedTokens = useMemo(() => {
    if (!filtered) return [];
    if (!sortKey || !sortDirection) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = (a as any)[sortKey as string];
      const bv = (b as any)[sortKey as string];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDirection === 'asc' ? av - bv : bv - av;
      }
      return sortDirection === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [filtered, sortKey, sortDirection]);

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: sortedTokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 8,
    getItemKey: (index) => sortedTokens[index]?.id ?? index,
  });

  function toggleSort(key: 'price' | 'change24h' | 'volume24h' | 'liquidity') {
    if (sortKey !== key) {
      dispatch(setSort({ key, direction: 'desc' }));
      return;
    }
    const next = sortDirection === 'desc' ? 'asc' : 'desc';
    dispatch(setSort({ key, direction: next }));
  }

  if (isLoading) return <TokenTableSkeleton />;

  if (isError)
    return (
      <div className="p-4">
        <div className="text-red-600 mb-2">Error loading tokens.</div>
        <button className="px-3 py-1 border rounded" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );

  const items = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className="w-full card">
      <div className="table-header flex items-center gap-3 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          {(Object.keys(TAB_LABELS) as TabKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              className={clsx('btn btn-sm', activeTab === k ? 'bg-slate-100 font-semibold' : 'btn-ghost')}
            >
              {TAB_LABELS[k]}
            </button>
          ))}
        </div>

        <div className="ml-auto hidden sm:flex items-center gap-4 text-sm">
          <div
            className="w-28 text-right cursor-pointer select-none text-sm"
            onClick={() => toggleSort('price')}
            role="button"
            aria-pressed={sortKey === 'price'}
          >
            Price {sortKey === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </div>

          <div
            className="w-24 text-right cursor-pointer select-none text-sm"
            onClick={() => toggleSort('change24h')}
            role="button"
            aria-pressed={sortKey === 'change24h'}
          >
            24h {sortKey === 'change24h' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </div>

          <div
            className="w-32 text-right cursor-pointer select-none text-sm"
            onClick={() => toggleSort('volume24h')}
            role="button"
            aria-pressed={sortKey === 'volume24h'}
          >
            Volume {sortKey === 'volume24h' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </div>
        </div>
      </div>

      <div ref={parentRef} className="h-[600px] overflow-auto">
        <div style={{ height: totalSize, position: 'relative' }}>
          {items.map((virtualRow) => {
            const token = sortedTokens[virtualRow.index];
            if (!token) return null;
            return (
              <div
                key={token.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <TokenRow token={token} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
