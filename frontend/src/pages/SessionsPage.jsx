import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchSessions, createSession } from '../redux/slices/sessionSlice';
import {
  Plus, Users, Code2, Loader2, Search, Trash2,
  ArrowRight, Calendar, Globe, Lock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const LANGS = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'html', 'css', 'json'];

export default function SessionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector(s => s.sessions);
  const { user } = useSelector(s => s.auth);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', language: 'javascript' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchSessions()); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setCreating(true);
    const res = await dispatch(createSession(form));
    setCreating(false);
    if (!res.error) {
      toast.success('Session created!');
      setShowModal(false);
      setForm({ title: '', description: '', language: 'javascript' });
      navigate(`/editor/${res.payload.session._id}`);
    } else {
      toast.error(res.payload || 'Failed to create session');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      toast.success('Session deleted');
      dispatch(fetchSessions());
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = list.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.language.toLowerCase().includes(search.toLowerCase())
  );

  const langColors = {
    javascript: 'bg-yellow-500/10 text-yellow-400', typescript: 'bg-blue-500/10 text-blue-400',
    python: 'bg-blue-400/10 text-blue-300', java: 'bg-orange-500/10 text-orange-400',
    c: 'bg-purple-500/10 text-purple-400', cpp: 'bg-pink-500/10 text-pink-400',
    html: 'bg-red-500/10 text-red-400', css: 'bg-cyan-500/10 text-cyan-400',
    json: 'bg-green-500/10 text-green-400',
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Collaboration Sessions</h2>
          <p className="text-text-muted text-sm mt-1">{list.length} sessions total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Session
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search sessions..."
          className="input-field pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Sessions grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-text-muted" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Code2 size={48} className="mx-auto text-text-dim mb-4" />
          <p className="text-text-secondary font-medium">No sessions found</p>
          <p className="text-text-muted text-sm mt-1">Create your first collaboration session</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4 text-sm inline-flex items-center gap-2">
            <Plus size={15} /> Create Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(session => (
            <div key={session._id} className="glass-card p-5 hover:border-accent-purple/30 transition-all duration-200 group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center">
                  <Code2 size={18} className="text-accent-purple" />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium ${langColors[session.language] || 'bg-bg-hover text-text-muted'}`}>
                  {session.language}
                </span>
              </div>
              <h3 className="font-semibold text-text-primary group-hover:text-accent-purple transition-colors truncate">{session.title}</h3>
              {session.description && <p className="text-sm text-text-muted mt-1 line-clamp-2">{session.description}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <Users size={11} />
                  <span>{session.participants?.length || 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={11} />
                  <span>{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  {session.owner?._id === user?._id ? <Globe size={11} /> : <Lock size={11} />}
                  <span>{session.owner?._id === user?._id ? 'Owner' : 'Member'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => navigate(`/editor/${session._id}`)}
                  className="flex-1 btn-primary text-xs flex items-center justify-center gap-1.5"
                >
                  Open <ArrowRight size={12} />
                </button>
                {session.owner?._id === user?._id && (
                  <button
                    onClick={() => handleDelete(session._id)}
                    className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-5">New Session</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="My awesome session"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="What are you working on?"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Language</label>
                <select
                  className="input-field"
                  value={form.language}
                  onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                >
                  {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  {creating ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
