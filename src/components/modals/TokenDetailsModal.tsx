// src/components/modals/TokenDetailsModal.tsx
'use client';

import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeDetailsModal, selectToken } from '../../store/tokensSlice';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import type { Token } from '../../types/token';
import { X } from 'lucide-react';

export default function TokenDetailsModal() {
  const dispatch = useAppDispatch();
  const { selectedTokenId, isDetailsModalOpen } = useAppSelector((s) => s.tokensUI);
  const qc = useQueryClient();

  const token = useMemo<Token | undefined>(() => {
    if (!selectedTokenId) return undefined;
    const byId = qc.getQueryData<Record<string, Token>>(['tokens', 'byId']);
    if (byId && byId[selectedTokenId]) return byId[selectedTokenId];
    const list = qc.getQueryData<Token[]>(['tokens']);
    if (list) return list.find((t) => t.id === selectedTokenId);
    return undefined;
  }, [qc, selectedTokenId]);

  function handleClose() {
    dispatch(closeDetailsModal());
    dispatch(selectToken(null));
  }

  return (
    <Dialog.Root open={isDetailsModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content className={clsx('dialog-content')} aria-label="Token details">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-lg font-semibold">
                {token ? token.symbol.slice(0, 2) : '—'}
              </div>

              <div>
                <Dialog.Title className="text-lg font-semibold">
                  {token ? `${token.symbol} — ${token.name}` : 'Token details'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-500">
                  {token ? token.pair : 'No token selected'}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                aria-label="Close"
                onClick={handleClose}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md border text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <div className="text-2xl font-mono">
                  {token ? `$${token.price.toFixed(6)}` : '—'}
                </div>
                <div className={clsx('text-sm font-medium', token?.change24h && token.change24h >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {token ? `${token.change24h.toFixed(2)}% (24h)` : '—'}
                </div>
              </div>

              <div className="text-sm text-slate-600">
                <div><strong>Volume (24h):</strong> {token ? Intl.NumberFormat().format(token.volume24h) : '—'}</div>
                <div><strong>Liquidity:</strong> {token ? Intl.NumberFormat().format(token.liquidity) : '—'}</div>
                <div><strong>Status:</strong> <StatusBadge status={token?.status} /></div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Market Summary</h4>
                <div className="text-xs text-slate-600">
                  Demo summary — replace with charts or metrics as needed.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 rounded-md bg-slate-900 text-white font-medium hover:opacity-95">
                  Trade on DEX
                </button>
                <button className="px-4 py-2 rounded-md border text-slate-700 hover:bg-slate-50">
                  Add to Watchlist
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded">
                <div className="text-xs text-slate-500">Last updated</div>
                <div className="text-sm text-slate-700">
                  {token ? new Date().toLocaleString() : '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded text-sm text-slate-700">
                <strong>Pair:</strong> {token?.pair ?? '—'}
                <br />
                <strong>Token ID:</strong> {token?.id ?? '—'}
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <Dialog.Close asChild>
              <button onClick={handleClose} className="px-4 py-2 rounded-md border text-sm text-slate-700 hover:bg-slate-50">Close</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StatusBadge({ status }: { status?: Token['status'] }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>;
  const map: Record<Token['status'], { label: string; className: string }> = {
    'new': { label: 'New', className: 'badge badge-new' },
    'final-stretch': { label: 'Final Stretch', className: 'badge badge-final' },
    'migrated': { label: 'Migrated', className: 'badge badge-migrated' },
  };
  const info = map[status];
  return <span className={info.className}>{info.label}</span>;
}
