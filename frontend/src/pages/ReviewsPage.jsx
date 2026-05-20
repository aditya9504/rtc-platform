import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  MessageSquareCode, Plus, Loader2, Search, Filter,
  CheckCircle2, XCircle, Clock, Activity, User, MessageCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_FILTERS = ['all', 'pending', 'in-review', 'approved', 'rejected'];

const statusConfig = {
  pending: { label: 'Pending', color: 'text-accent-yellow', bg: 'bg-accent-yellow/10 border-accent-yellow/20', icon: Clock },
  'in-review': { label: 'In Review', color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/20', icon: Activity },
  approved: { label: 'Approved', color: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-accent-red', bg: 'bg-accent-red/10 border-accent-red/20', icon: XCircle },
  'changes-requested': { label: 'Changes Requested', color: 'text-accent-orange', bg: 'bg-accent-orange/10 border-accent-orange/20', icon: Activity },
};

export default function ReviewsPage() {
  const { user } = useSelector(s => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', code: '', language: 'javascript' });
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/reviews${params}`);
      setReviews(res.data.reviews || []);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/reviews', form);
      setReviews(prev => [res.data.review, ...prev]);
      setShowModal(false);
      setForm({ title: '', description: '', code: '', language: 'javascript' });
      toast.success('Review created!');
    } catch { toast.error('Failed to create review'); }
    finally { setCreating(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/reviews/${id}`, { status });
      setReviews(prev => prev.map(r => r._id === id ? res.data.review : r));
      if (selected?._id === id) setSelected(res.data.review);
      toast.success(`Review ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const handleComment = async () => {
    if (!comment.trim() || !selected) return;
    try {
      const res = await api.post(`/reviews/${selected._id}/comments`, { content: comment });
      setSelected(res.data.review);
      setComment('');
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
  };

  const filtered = reviews.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.author?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Code Reviews</h2>
          <p className="text-text-muted text-sm mt-1">{reviews.length} total reviews</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Review
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input-field pl-9 text-sm" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${statusFilter === s ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' : 'bg-bg-tertiary text-text-muted border-border hover:border-accent-purple/20'}`}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review list */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-text-muted" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <MessageSquareCode size={48} className="mx-auto text-text-dim mb-4" />
              <p className="text-text-secondary font-medium">No reviews found</p>
            </div>
          ) : filtered.map(review => {
            const cfg = statusConfig[review.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={review._id}
                onClick={() => setSelected(review)}
                className={`glass-card p-4 cursor-pointer hover:border-accent-purple/30 transition-all duration-200 ${selected?._id === review._id ? 'border-accent-purple/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <StatusIcon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-text-primary text-sm truncate">{review.title}</h4>
                      <span className={`status-badge border flex-shrink-0 ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{review.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <User size={10} />
                        <span>{review.author?.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={10} />
                        <span>{review.comments?.length || 0} comments</span>
                      </div>
                      <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="glass-card p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-primary">{selected.title}</h3>
                <p className="text-xs text-text-muted mt-1">{selected.description}</p>
              </div>

              {/* Code preview */}
              <div>
                <p className="text-xs text-text-muted mb-2 font-medium">Code</p>
                <pre className="bg-bg-primary rounded-xl p-3 text-xs font-mono text-text-secondary overflow-x-auto max-h-40 overflow-y-auto border border-border">
                  {selected.code?.slice(0, 500)}{selected.code?.length > 500 ? '\n...' : ''}
                </pre>
              </div>

              {/* Status actions */}
              {selected.author?._id !== user._id && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(selected._id, 'approved')} className="flex-1 text-xs py-2 rounded-lg bg-accent-green/15 text-accent-green border border-accent-green/25 hover:bg-accent-green/25 transition-all flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button onClick={() => handleStatusChange(selected._id, 'rejected')} className="flex-1 text-xs py-2 rounded-lg bg-accent-red/15 text-accent-red border border-accent-red/25 hover:bg-accent-red/25 transition-all flex items-center justify-center gap-1.5">
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              )}

              {/* Comments */}
              <div>
                <p className="text-xs text-text-muted mb-2 font-medium">Comments ({selected.comments?.length || 0})</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selected.comments?.map((c, i) => (
                    <div key={i} className="bg-bg-tertiary rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center text-[10px] text-accent-purple font-bold">
                          {c.author?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-text-secondary font-medium">{c.author?.username}</span>
                      </div>
                      <p className="text-text-muted">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    className="input-field flex-1 text-xs py-2"
                    placeholder="Add comment..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                  />
                  <button onClick={handleComment} className="btn-primary text-xs px-3">Send</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-text-muted">
              <MessageSquareCode size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Select a review</p>
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-lg animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-5">Create Review</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Title *</label>
                <input className="input-field" placeholder="Review title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Description</label>
                <textarea className="input-field resize-none h-16" placeholder="What should reviewers focus on?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Language</label>
                <select className="input-field" value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
                  {['javascript','typescript','python','java','c','cpp','html','css','json'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Code *</label>
                <textarea className="input-field resize-none h-32 font-mono text-xs" placeholder="Paste your code here..." value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  {creating ? <><Loader2 size={14} className="animate-spin" />Creating...</> : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
