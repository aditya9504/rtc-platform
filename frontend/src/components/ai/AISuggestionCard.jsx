import React from 'react';

export default function AISuggestionCard({ title, children, className = '' }) {
  return (
    <div className={`bg-bg-secondary border border-border rounded-3xl p-4 shadow-xl shadow-black/10 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <span className="text-[11px] uppercase tracking-[0.2em] text-text-muted">AI</span>
      </div>
      <div className="space-y-3 text-sm leading-6 text-text-secondary">{children}</div>
    </div>
  );
}
