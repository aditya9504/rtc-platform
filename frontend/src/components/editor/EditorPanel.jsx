import React, { useRef, useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCode, setLanguage, setOutput, clearOutput, setIsRunning,
  addCollaborator, removeCollaborator, setCollaborators, updateFileCode,
  setActiveFile, addFile, setIsSaving, setLastSaved
} from '../../redux/slices/editorSlice';
import { analyzeCode, openPanel } from '../../redux/slices/aiSlice';
import {
  Play, Loader2, Trash2, ChevronDown, Plus, Circle,
  Save, Users, Terminal, CheckCircle, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'c', label: 'C', ext: 'c' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'html', label: 'HTML', ext: 'html' },
  { id: 'css', label: 'CSS', ext: 'css' },
  { id: 'json', label: 'JSON', ext: 'json' },
];

const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: '"Fira Code", "Cascadia Code", monospace',
  fontLigatures: true,
  minimap: { enabled: true },
  wordWrap: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  renderLineHighlight: 'all',
  lineNumbers: 'on',
  folding: true,
  bracketPairColorization: { enabled: true },
  suggest: { preview: true },
  fixedOverflowWidgets: true,
  padding: { top: 12, bottom: 12 },
  direction: 'ltr',
};

const OutputLine = ({ line }) => {
  const colors = { error: 'text-red-400', warn: 'text-yellow-400', info: 'text-blue-400', log: 'text-green-400' };
  return (
    <div className={`font-mono text-xs leading-relaxed ${colors[line.type] || 'text-text-primary'} flex items-start gap-2`}>
      <span className="text-text-muted text-[10px] mt-0.5 flex-shrink-0 tabular-nums">
        {new Date(line.timestamp || Date.now()).toLocaleTimeString('en-US', { hour12: false })}
      </span>
      <span className="whitespace-pre-wrap break-all">{line.msg}</span>
    </div>
  );
};

export default function EditorPanel({ sessionId, roomId }) {
  const dispatch = useDispatch();
  const { code, language, output, isRunning, activeFile, files, collaborators, isSaving, lastSaved } = useSelector(s => s.editor);
  const { user } = useSelector(s => s.auth);
  const editorRef = useRef(null);
  const consoleRef = useRef(null);
  const isRemoteChange = useRef(false);
  const saveTimer = useRef(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  // Socket integration
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit('join-room', { roomId, user: { id: user._id, username: user.username } });

    socket.on('room-users', (users) => dispatch(setCollaborators(users)));
    socket.on('user-joined', (u) => {
      dispatch(addCollaborator(u));
      toast(`${u.username} joined`, { icon: '👋', duration: 2000 });
    });
    socket.on('user-left', ({ user: u }) => {
      dispatch(removeCollaborator(u?.socketId));
      if (u?.username) toast(`${u.username} left`, { duration: 2000 });
    });
    socket.on('code-update', ({ code: newCode, userId }) => {
      if (userId !== user._id) {
        isRemoteChange.current = true;
        dispatch(setCode(newCode));
        dispatch(updateFileCode(newCode));
      }
    });
    socket.on('language-update', ({ language: lang }) => dispatch(setLanguage(lang)));
    socket.on('code-sync', ({ code: syncCode, language: syncLang }) => {
      dispatch(setCode(syncCode));
      dispatch(setLanguage(syncLang));
    });
    socket.on('code-saved', () => {
      dispatch(setIsSaving(false));
      dispatch(setLastSaved(new Date().toISOString()));
    });

    return () => {
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('code-sync');
      socket.off('code-saved');
    };
  }, [roomId, user._id]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // Mount overflow widgets to document.body to fix z-index issues
    try {
      const domNode = editor.getDomNode();
      if (domNode) {
        domNode.style.overflow = 'visible';
      }
    } catch (e) {}
  };

  const handleCodeChange = useCallback((value) => {
    if (isRemoteChange.current) { isRemoteChange.current = false; return; }
    const newCode = value || '';
    dispatch(setCode(newCode));
    dispatch(updateFileCode(newCode));

    // Emit to socket
    const socket = getSocket();
    if (socket && roomId) socket.emit('code-change', { roomId, code: newCode, userId: user._id });

    // Auto-save debounce
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (socket && roomId) {
        dispatch(setIsSaving(true));
        socket.emit('save-code', { roomId, code: newCode, language });
      }
    }, 2000);
  }, [roomId, user._id, language]);

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    setShowLangDropdown(false);
    const socket = getSocket();
    if (socket && roomId) socket.emit('language-change', { roomId, language: lang });
    toast.success(`Switched to ${lang}`);
  };

  const handleRun = async () => {
    dispatch(setIsRunning(true));
    dispatch(clearOutput());
    dispatch(setOutput([{ type: 'info', msg: `▶ Running ${language}...`, timestamp: Date.now() }]));
    try {
      const res = await api.post('/run', { code, language });
      const lines = (res.data.output || []).map(l => ({ ...l, timestamp: Date.now() }));
      dispatch(setOutput([
        { type: 'info', msg: `▶ Executed in ${res.data.duration}ms`, timestamp: Date.now() },
        ...lines,
        { type: 'info', msg: '✓ Finished', timestamp: Date.now() },
      ]));
    } catch (err) {
      dispatch(setOutput([{ type: 'error', msg: err.response?.data?.message || err.message, timestamp: Date.now() }]));
    } finally {
      dispatch(setIsRunning(false));
    }
  };

  const handleAddFile = () => {
    const name = prompt('File name (e.g. utils.js):');
    if (!name) return;
    const ext = name.split('.').pop();
    const langMap = { js: 'javascript', ts: 'typescript', py: 'python', java: 'java', c: 'c', cpp: 'cpp', html: 'html', css: 'css', json: 'json' };
    dispatch(addFile({ name, language: langMap[ext] || 'javascript', code: '' }));
  };

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [output]);

  // Resize handler
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startH = consoleHeight;
    const onMove = (me) => {
      const newH = Math.max(80, Math.min(400, startH - (me.clientY - startY)));
      setConsoleHeight(newH);
    };
    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  // Build dynamic monaco options from redux
  const monacoOptions = {
    ...MONACO_OPTIONS,
    fontSize: useSelector(s => s.editor.fontSize),
    wordWrap: useSelector(s => s.editor.wordWrap),
    minimap: { enabled: useSelector(s => s.editor.minimap) },
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg-secondary border-b border-border flex-shrink-0">
        {/* File tabs */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 mr-2 scrollbar-hide">
          {files.map(f => (
            <button key={f.name} onClick={() => dispatch(setActiveFile(f.name))}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg flex-shrink-0 transition-all font-mono ${
                f.name === activeFile
                  ? 'bg-bg-primary text-text-primary border border-border'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
              }`}>
              <Circle size={6} className={f.name === activeFile ? 'text-accent-purple' : 'text-text-dim'} />
              {f.name}
            </button>
          ))}
          <button onClick={handleAddFile} className="flex items-center p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-lg transition-all flex-shrink-0">
            <Plus size={14} />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Collaborators */}
          {collaborators.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              <Users size={12} className="text-accent-green" />
              <div className="flex -space-x-1">
                {collaborators.slice(0, 3).map((c, i) => (
                  <div key={i} title={c.username}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue border border-bg-secondary flex items-center justify-center text-[10px] text-white font-bold">
                    {c.username?.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              {collaborators.length > 3 && <span className="text-xs text-text-muted">+{collaborators.length - 3}</span>}
            </div>
          )}

          {/* Save status */}
          {isSaving ? (
            <span className="text-xs text-text-muted flex items-center gap-1"><Loader2 size={10} className="animate-spin" />Saving...</span>
          ) : lastSaved ? (
            <span className="text-xs text-accent-green flex items-center gap-1"><CheckCircle size={10} />Saved</span>
          ) : null}

          {/* Language selector */}
          <div className="relative">
            <button onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-accent-purple/30 transition-all">
              <span className="font-mono">{currentLang.label}</span>
              <ChevronDown size={12} />
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-bg-secondary border border-border rounded-xl shadow-card z-50 py-1 overflow-hidden">
                {LANGUAGES.map(lang => (
                  <button key={lang.id} onClick={() => handleLanguageChange(lang.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-hover transition-colors text-left ${lang.id === language ? 'text-accent-purple' : 'text-text-secondary'}`}>
                    <span className="font-mono text-text-muted w-8">.{lang.ext}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run button */}
          <button onClick={handleRun} disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-green/20 hover:bg-accent-green/30 text-accent-green border border-accent-green/30 rounded-lg text-xs font-medium transition-all hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-60">
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            {isRunning ? 'Running...' : 'Run'}
          </button>

          {/* AI Suggestion button */}
          <button onClick={() => {
            dispatch(openPanel());
            dispatch(analyzeCode({ code, language }));
          }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border border-fuchsia-500/30 rounded-lg text-xs font-medium transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] active:scale-95">
            <Sparkles size={13} />
            AI Suggestion
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          options={monacoOptions}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full bg-bg-primary">
              <Loader2 size={24} className="animate-spin text-accent-purple" />
            </div>
          }
        />
      </div>

      {/* Resize handle */}
      <div onMouseDown={handleMouseDown}
        className="flex items-center justify-center h-1.5 bg-border hover:bg-accent-purple/40 cursor-ns-resize flex-shrink-0 transition-colors group">
        <div className="w-12 h-0.5 bg-text-dim group-hover:bg-accent-purple rounded-full" />
      </div>

      {/* Console panel */}
      <div style={{ height: `${consoleHeight}px` }} className="flex flex-col bg-bg-secondary border-t border-border flex-shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-accent-green" />
            <span className="text-xs font-medium text-text-secondary">Console</span>
            {output.length > 0 && (
              <span className="text-[10px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded">{output.length}</span>
            )}
          </div>
          <button onClick={() => dispatch(clearOutput())}
            className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-bg-hover">
            <Trash2 size={11} /> Clear
          </button>
        </div>
        <div ref={consoleRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
          {output.length === 0 ? (
            <div className="flex items-center gap-2 text-text-dim text-xs font-mono">
              <span className="text-accent-green">$</span>
              <span className="cursor-blink">_</span>
              <span>Ready to run code...</span>
            </div>
          ) : (
            output.map((line, i) => <OutputLine key={i} line={line} />)
          )}
        </div>
      </div>
    </div>
  );
}
