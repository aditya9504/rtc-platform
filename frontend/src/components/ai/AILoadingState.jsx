import React from 'react';

export default function AILoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-28 rounded-3xl bg-slate-800/80 border border-slate-700" />
      ))}
      <div className="h-44 rounded-3xl bg-slate-800/80 border border-slate-700" />
    </div>
  );
}
