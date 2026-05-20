import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  GitPullRequest, Plus, Loader2, Search, CheckCircle2,
  XCircle, Clock, GitMerge, User, MessageCircle, Plus as PlusIcon
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  open: { label: 'Open', color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/20', icon: GitPullRequest },
  merged: { label: 'Merged', color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20', icon: GitMerge },
  closed: { label: 'Closed', color: 'text-text-muted', bg: 'bg-bg-hover border-border', icon: XCircle },
  draft: { label: 'Draft', color: 'text-text-secondary', bg: 'bg-bg-tertiary border-border', icon: Clock },
};

export default function PullRequestsPage() {
  const { user } = useSelector(s => s.auth);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', language: 'javascript', sourceCode: '', targetCode: '' });
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/pull-requests${params}`);
      setPrs(res.data.pullRequests || []);
    } catch { toast.error('Failed to load PRs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPRs(); }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/pull-requests', form);
      setPrs(prev => [res.data.pullRequest, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', language: 'javascript', sourceCode: '', targetCode: '' });
      toast.success('Pull request created!');
    } catch { toast.error('Failed to create PR'); }
    finally { setCreating(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/pull-requests/${id}`, { status });
      setPrs(prev => prev.map(p => p._id === id ? res.data.pullRequest : p));
      if (selected?._id === id) setSelected(res.data.pullRequest);
      toast.success(`PR ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const handleComment = async () => {
    if (!comment.trim() || !selected) return;
    try {
      const res = await api.post(`/pull-requests/${selected._id}/comments`, { content: comment });
      setSelected(res.data.pullRequest);
      setComment('');
    } catch { toast.error('Failed to add comment'); }
  };

  const filtered = prs.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Pull Requests</h2>
          <p className="text-text-muted text-sm mt-1">{prs.filter(p => p.status === 'open').length} open · {prs.filter(p => p.status === 'merged').length} merged</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New PR
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input-field pl-9 text-sm" placeholder="Search PRs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'open', 'draft', 'merged', 'closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${statusFilter === s ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' : 'bg-bg-tertiary text-text-muted border-border hover:border-accent-purple/20'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-text-muted" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <GitPullRequest size={48} className="mx-auto text-text-dim mb-4" />
              <p className="text-text-secondary font-medium">No pull requests found</p>
            </div>
          ) : filtered.map(pr => {
            const cfg = statusConfig[pr.status] || statusConfig.open;
            const StatusIcon = cfg.icon;
            return (
              <div key={pr._id} onClick={() => setSelected(pr)}
                className={`glass-card p-4 cursor-pointer hover:border-accent-purple/30 transition-all ${selected?._id === pr._id ? 'border-accent-purple/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <StatusIcon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-text-primary text-sm">{pr.title}</h4>
                      <span className={`status-badge border flex-shrink-0 ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{pr.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <div className="flex items-center gap-1"><User size={10} /><span>{pr.author?.username}</span></div>
                      <div className="flex items-center gap-1"><MessageCircle size={10} /><span>{pr.comments?.length || 0}</span></div>
                      <span className="text-accent-green">+{pr.additions}</span>
                      <span className="text-accent-red">-{pr.deletions}</span>
                      <span>{formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {(() => { const cfg = statusConfig[selected.status]; const Icon = cfg.icon; return <Icon size={14} className={cfg.color} />; })()}
                  <span className="text-xs text-text-muted">{statusConfig[selected.status]?.label}</span>
                </div>
                <h3 className="font-semibold text-text-primary">{selected.title}</h3>
                <p className="text-xs text-text-muted mt-1">{selected.description}</p>
              </div>

              {selected.status === 'open' && selected.author?._id !== user._id && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(selected._id, 'merged')}
                    className="flex-1 text-xs py-2 rounded-lg bg-accent-purple/15 text-accent-purple border border-accent-purple/25 hover:bg-accent-purple/25 transition-all flex items-center justify-center gap-1.5">
                    <GitMerge size={13} /> Merge
                  </button>
                  <button onClick={() => handleStatusChange(selected._id, 'closed')}
                    className="flex-1 text-xs py-2 rounded-lg bg-accent-red/15 text-accent-red border border-accent-red/25 hover:bg-accent-red/25 transition-all flex items-center justify-center gap-1.5">
                    <XCircle size={13} /> Close
                  </button>
                </div>
              )}

              {selected.sourceCode && (
                <div>
                  <p className="text-xs text-text-muted mb-1 font-medium">Changes</p>
                  <pre className="bg-bg-primary rounded-xl p-3 text-xs font-mono text-text-secondary overflow-x-auto max-h-32 overflow-y-auto border border-border">
                    {selected.sourceCode?.slice(0, 300)}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-xs text-text-muted mb-2 font-medium">Comments ({selected.comments?.length || 0})</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selected.comments?.map((c, i) => (
                    <div key={i} className="bg-bg-tertiary rounded-xl p-2.5 text-xs">
                      <span className="text-accent-purple font-medium">{c.author?.username}</span>
                      <p className="text-text-muted mt-0.5">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input className="input-field flex-1 text-xs py-2" placeholder="Add comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleComment()} />
                  <button onClick={handleComment} className="btn-primary text-xs px-3">Send</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-text-muted">
              <GitPullRequest size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Select a PR</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-lg animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-5">New Pull Request</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Title *</label>
                <input className="input-field" placeholder="PR title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Description</label>
                <textarea className="input-field resize-none h-16" placeholder="Describe your changes..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Source Code</label>
                <textarea className="input-field resize-none h-24 font-mono text-xs" placeholder="New/changed code..." value={form.sourceCode} onChange={e => setForm(p => ({ ...p, sourceCode: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  {creating ? <><Loader2 size={14} className="animate-spin" />Creating...</> : 'Create PR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
