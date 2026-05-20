import React from 'react';
import { Sparkles, RefreshCcw } from 'lucide-react';

export default function AIEmptyState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 rounded-3xl border border-border bg-bg-secondary shadow-sm">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-300 mb-4">
        <Sparkles size={24} />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-primary">{message || 'AI analysis is ready when your code is available.'}</p>
        <p className="text-xs text-text-muted max-w-[250px] mx-auto">
          {message ? 'Use Analyze Again to refresh suggestions.' : 'Open the panel and run the analyzer again if you want fresh results.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-2xl text-xs font-semibold transition hover:bg-accent-purple/90"
        >
          <RefreshCcw size={14} /> Analyze Again
        </button>
      )}
    </div>
  );
}
