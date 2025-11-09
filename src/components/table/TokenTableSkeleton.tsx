// src/components/table/TokenTableSkeleton.tsx
'use client';

import React from 'react';

export default function TokenTableSkeleton() {
  return (
    <div className="w-full card">
      <div className="table-header flex items-center gap-3 px-4 py-3 border-b">
        <div className="h-4 w-40 bg-slate-100 rounded" />
      </div>

      <div className="space-y-3 p-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-white rounded">
            <div className="w-10">
              <div className="w-8 h-8 bg-slate-200 rounded animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-36 skeleton" />
              <div className="h-3 bg-slate-100 rounded w-24 skeleton" />
            </div>

            <div className="w-28 text-right">
              <div className="h-4 bg-slate-200 rounded w-24 mx-auto skeleton" />
            </div>

            <div className="w-24 text-right">
              <div className="h-4 bg-slate-200 rounded w-16 mx-auto skeleton" />
            </div>

            <div className="w-20 text-right">
              <div className="h-6 bg-slate-200 rounded w-18 mx-auto skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
