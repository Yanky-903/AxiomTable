// src/app/page.tsx
'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setSort, selectToken, openDetailsModal, closeDetailsModal } from '../store/tokensSlice';
import dynamic from 'next/dynamic';
const TokenDetailsModal = dynamic(() => import('../components/modals/TokenDetailsModal'), { ssr: false });

// Try to import the TokenTable; if it doesn't exist yet, show a small message.
// (This keeps the page resilient while you add component files.)
let TokenTable: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // @ts-ignore
  TokenTable = require('../components/table/TokenTable').default;
} catch (e) {
  TokenTable = null;
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { sortKey, sortDirection, selectedTokenId, isDetailsModalOpen } = useAppSelector(
    (s) => s.tokensUI
  );

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto w-full max-w-6xl bg-white rounded-md shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Axiom Token Table — Dev Playground</h1>

        <section className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <strong>Sort:</strong>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border text-sm"
                onClick={() => dispatch(setSort({ key: 'price', direction: sortDirection ?? 'desc' }))}
              >
                By Price
              </button>
              <button
                className="px-3 py-1 rounded border text-sm"
                onClick={() =>
                  dispatch(setSort({ key: 'change24h', direction: sortDirection ?? 'desc' }))
                }
              >
                By Change (24h)
              </button>
              <button
                className="px-3 py-1 rounded border text-sm"
                onClick={() => dispatch(setSort({ key: null, direction: null }))}
              >
                Clear Sort
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <strong>Direction:</strong>
            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() =>
                dispatch(
                  setSort({
                    key: sortKey,
                    direction: sortDirection === 'asc' ? 'desc' : 'asc',
                  })
                )
              }
            >
              Toggle Direction ({sortDirection ?? 'none'})
            </button>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Selection & Modal</h2>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => dispatch(selectToken('token-123'))}
            >
              Select token-123
            </button>
            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => dispatch(selectToken(null))}
            >
              Clear selection
            </button>

            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => dispatch(openDetailsModal())}
            >
              Open Details Modal
            </button>
            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => dispatch(closeDetailsModal())}
            >
              Close Modal
            </button>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            <div>
              <strong>Selected token:</strong> {selectedTokenId ?? '—'}
            </div>
            <div>
              <strong>Details modal open:</strong> {isDetailsModalOpen ? 'Yes' : 'No'}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Current Redux UI State</h2>
          <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">
            {JSON.stringify({ sortKey, sortDirection, selectedTokenId, isDetailsModalOpen }, null, 2)}
          </pre>
        </section>
      </div>

      {/* Token table area */}
      <div className="mx-auto w-full max-w-6xl mt-6">
        {TokenTable ? (
          <TokenTable />
        ) : (
          <div className="p-6 bg-white rounded shadow text-sm text-slate-600">
            <strong>TokenTable component not found.</strong>
            <div className="mt-2">Create <code>src/components/table/TokenTable.tsx</code> (I provided code earlier) and reload.</div>
          </div>
        )}
      </div>

      {/* Mount the modal once at page level (client-only via dynamic import) */}
      <TokenDetailsModal />
    </div>
  );
}
