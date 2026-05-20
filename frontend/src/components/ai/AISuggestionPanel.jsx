import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { analyzeCode, closePanel } from '../../redux/slices/aiSlice';
import AISuggestionCard from './AISuggestionCard';
import AIEmptyState from './AIEmptyState';
import AILoadingState from './AILoadingState';

const languageMap = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  html: 'html',
  css: 'css',
  json: 'json',
};

export default function AISuggestionPanel() {
  const dispatch = useDispatch();
  const { loading, error, suggestions, lastAnalyzedAt, panelOpen } = useSelector((state) => state.ai);
  const { code, language } = useSelector((state) => state.editor);

  const prismLanguage = languageMap[language] || 'javascript';

  useEffect(() => {
    if (!panelOpen) return undefined;
    const timer = setTimeout(() => {
      dispatch(analyzeCode({ code, language }));
    }, 700);
    return () => clearTimeout(timer);
  }, [dispatch, panelOpen, code, language]);

  const hasResults = useMemo(() => {
    return (
      !!suggestions.summary ||
      suggestions.problems.length > 0 ||
      suggestions.suggestions.length > 0 ||
      suggestions.modifications.length > 0 ||
      !!suggestions.improvedCode
    );
  }, [suggestions]);

  const handleClose = () => dispatch(closePanel());
  const handleRetry = () => dispatch(analyzeCode({ code, language }));

  return (
    <div className="h-full flex flex-col bg-bg-secondary border-l border-border shadow-[0_0_30px_rgba(15,23,42,0.55)] overflow-hidden">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-4 bg-bg-secondary border-b border-border backdrop-blur-md">
        <div>
          <h2 className="text-base font-semibold text-text-primary">AI Suggestions</h2>
          <p className="text-xs text-text-muted">Analyze current editor code and improve quality.</p>
        </div>
        <button
          onClick={handleClose}
          className="rounded-2xl p-2 bg-bg-primary/80 border border-border text-text-muted hover:text-text-primary transition"
          aria-label="Close AI panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-violet-900 via-slate-900 to-slate-900 border border-violet-700/40 shadow-inner">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Live analysis</p>
            <p className="mt-1 text-sm font-medium text-text-primary">Current code snapshot from editor</p>
          </div>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-accent-purple rounded-2xl hover:bg-accent-purple/90 transition disabled:opacity-60"
          >
            <RefreshCcw size={14} /> Analyze Again
          </button>
        </div>

        {loading && <AILoadingState />}

        {!loading && error && (
          <AISuggestionCard title="Analysis Error">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <AlertTriangle size={18} className="text-amber-400" />
                <span>Unable to complete AI analysis.</span>
              </div>
              <p className="text-xs text-text-muted">{error}</p>
              <button
                onClick={handleRetry}
                className="self-start inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-accent-purple rounded-2xl hover:bg-accent-purple/90 transition"
              >
                Retry
              </button>
            </div>
          </AISuggestionCard>
        )}

        {!loading && !error && !hasResults && (
          <AIEmptyState message="Nothing analyzed yet." onRetry={handleRetry} />
        )}

        {!loading && !error && hasResults && (
          <>
            <AISuggestionCard title="AI Summary">
              <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                {suggestions.summary || 'No summary available yet.'}
              </p>
              {lastAnalyzedAt && (
                <p className="text-[11px] text-text-muted">Last analyzed: {new Date(lastAnalyzedAt).toLocaleString()}</p>
              )}
            </AISuggestionCard>

            <AISuggestionCard title="Problems Found">
              {suggestions.problems.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside text-text-secondary text-sm">
                  {suggestions.problems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No critical problems detected.</p>
              )}
            </AISuggestionCard>

            <AISuggestionCard title="Suggestions">
              {suggestions.suggestions.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside text-text-secondary text-sm">
                  {suggestions.suggestions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No additional recommendations at this time.</p>
              )}
            </AISuggestionCard>

            <AISuggestionCard title="Recommended Modifications">
              {suggestions.modifications.length > 0 ? (
                <ul className="space-y-2 list-decimal list-inside text-text-secondary text-sm">
                  {suggestions.modifications.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No modifications were suggested.</p>
              )}
            </AISuggestionCard>

            {suggestions.improvedCode ? (
              <AISuggestionCard title="Improved Code Example" className="pb-0">
                <div className="rounded-3xl overflow-hidden border border-border bg-bg-primary">
                  <SyntaxHighlighter
                    language={prismLanguage}
                    style={oneDark}
                    showLineNumbers
                    wrapLongLines
                    customStyle={{ margin: 0, background: 'transparent', fontSize: 12, lineHeight: 1.5 }}
                  >
                    {suggestions.improvedCode}
                  </SyntaxHighlighter>
                </div>
              </AISuggestionCard>
            ) : (
              <AISuggestionCard title="Improved Code Example">
                <p className="text-sm text-text-muted">The AI did not provide an example code transformation.</p>
              </AISuggestionCard>
            )}
          </>
        )}
      </div>
    </div>
  );
}
