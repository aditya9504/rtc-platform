import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSession } from '../redux/slices/sessionSlice';
import { setCode, setLanguage } from '../redux/slices/editorSlice';
import { analyzeCode, openPanel } from '../redux/slices/aiSlice';
import EditorPanel from '../components/editor/EditorPanel';
import AISuggestionPanel from '../components/ai/AISuggestionPanel';
import { Loader2, Users, Code2, Copy, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const { current: session, loading } = useSelector(s => s.sessions);
  const { code: editorCode, language: editorLanguage } = useSelector((s) => s.editor);
  const panelOpen = useSelector((s) => s.ai.panelOpen);
  const [copied, setCopied] = useState(false);
  const [renderAI, setRenderAI] = useState(false);

  useEffect(() => {
    if (panelOpen) setRenderAI(true);
  }, [panelOpen]);

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSession(sessionId));
    }
  }, [sessionId]);

  useEffect(() => {
    if (session) {
      dispatch(setCode(session.code || ''));
      dispatch(setLanguage(session.language || 'javascript'));
    }
  }, [session]);

  const copyRoomId = () => {
    if (session?.roomId) {
      navigator.clipboard.writeText(session.roomId);
      setCopied(true);
      toast.success('Room ID copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-accent-purple" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Session header bar */}
      {session && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Code2 size={16} className="text-accent-purple" />
            <span className="text-sm font-medium text-text-primary">{session.title}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs text-accent-green">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                dispatch(openPanel());
                dispatch(analyzeCode({ code: editorCode, language: editorLanguage }));
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-fuchsia-500/10 hover:from-violet-500 hover:to-fuchsia-500 transition"
            >
              <Sparkles size={14} />
              AI Suggestion
            </button>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Users size={12} />
              <span>{session.participants?.length || 1} collaborator{session.participants?.length !== 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={copyRoomId}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-2.5 py-1.5 rounded-lg hover:bg-bg-hover transition-all"
            >
              {copied ? <Check size={12} className="text-accent-green" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Room ID'}
            </button>
          </div>
        </div>
      )}

      {/* Editor Panel — takes remaining height */}
      <div className="flex-1 overflow-hidden min-h-0 flex">
        <div className="flex-1 overflow-hidden min-h-0">
          <EditorPanel
            sessionId={sessionId}
            roomId={session?.roomId}
          />
        </div>
        <div className={`relative flex-shrink-0 transition-all duration-300 ${panelOpen ? 'w-[380px]' : 'w-0'}`}>
          {renderAI && (
            <div className={`absolute inset-y-0 right-0 h-full w-[380px] ${panelOpen ? 'translate-x-0' : 'translate-x-full'} transform transition-transform duration-300`}>
              <AISuggestionPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
