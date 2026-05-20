import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSessions, createSession } from '../redux/slices/sessionSlice';
import {
  Code2, GitPullRequest, MessageSquareCode, Users,
  Plus, Activity, Clock, TrendingUp, Zap, ArrowRight,
  Circle, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="glass-card p-5 hover:border-accent-purple/30 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend && <span className="text-xs text-accent-green font-medium">+{trend}%</span>}
    </div>
    <p className="text-2xl font-bold text-text-primary">{value}</p>
    <p className="text-sm text-text-muted mt-1">{label}</p>
  </div>
);

const statusConfig = {
  pending: { color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', icon: Clock },
  'in-review': { color: 'text-accent-blue', bg: 'bg-accent-blue/10', icon: Activity },
  approved: { color: 'text-accent-green', bg: 'bg-accent-green/10', icon: CheckCircle2 },
  rejected: { color: 'text-accent-red', bg: 'bg-accent-red/10', icon: XCircle },
  open: { color: 'text-accent-blue', bg: 'bg-accent-blue/10', icon: Circle },
  merged: { color: 'text-accent-purple', bg: 'bg-accent-purple/10', icon: CheckCircle2 },
  closed: { color: 'text-text-muted', bg: 'bg-bg-hover', icon: XCircle },
};

export default function DashboardPage() {
  const { user } = useSelector(s => s.auth);
  const { list: sessions, loading: sessLoading } = useSelector(s => s.sessions);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [prs, setPrs] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchSessions());
    api.get('/reviews').then(r => setReviews(r.data.reviews || [])).catch(() => {});
    api.get('/pull-requests').then(r => setPrs(r.data.pullRequests || [])).catch(() => {});
  }, []);

  const handleNewSession = async () => {
    setCreating(true);
    const res = await dispatch(createSession({ title: `Session ${Date.now()}`, language: 'javascript' }));
    setCreating(false);
    if (!res.error) {
      toast.success('Session created!');
      navigate(`/editor/${res.payload.session._id}`);
    }
  };

  const stats = [
    { label: 'Total Sessions', value: sessions.length, icon: Users, color: 'bg-gradient-to-br from-accent-purple to-accent-purple-dark', trend: 12 },
    { label: 'Code Reviews', value: reviews.length, icon: MessageSquareCode, color: 'bg-gradient-to-br from-accent-blue to-cyan-600', trend: 8 },
    { label: 'Pull Requests', value: prs.length, icon: GitPullRequest, color: 'bg-gradient-to-br from-accent-green to-emerald-700', trend: 5 },
    { label: 'Contributions', value: user?.stats?.contributions || 0, icon: TrendingUp, color: 'bg-gradient-to-br from-accent-orange to-yellow-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome banner */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/10 via-transparent to-accent-blue/10 pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-purple/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-text-muted text-sm">Good to see you,</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">
              Welcome back, <span className="text-accent-purple">{user?.username}</span>!
            </h2>
            <p className="text-text-muted mt-1">You have {reviews.filter(r => r.status === 'pending').length} pending reviews and {prs.filter(p => p.status === 'open').length} open PRs.</p>
          </div>
          <button onClick={handleNewSession} disabled={creating} className="btn-primary flex items-center gap-2 text-sm">
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            New Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent sessions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Users size={16} className="text-accent-purple" /> Recent Sessions
            </h3>
            <Link to="/sessions" className="text-xs text-accent-purple hover:text-accent-purple-light flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {sessLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-text-muted" /></div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                <Code2 size={32} className="mx-auto mb-2 opacity-30" />
                <p>No sessions yet. Create one!</p>
              </div>
            ) : sessions.slice(0, 5).map(session => (
              <Link key={session._id} to={`/editor/${session._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-all duration-150 group">
                <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                  <Code2 size={14} className="text-accent-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent-purple transition-colors">{session.title}</p>
                  <p className="text-xs text-text-muted">{formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-bg-hover text-text-muted font-mono">{session.language}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent PRs */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <GitPullRequest size={16} className="text-accent-blue" /> Recent Pull Requests
            </h3>
            <Link to="/pull-requests" className="text-xs text-accent-purple hover:text-accent-purple-light flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {prs.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                <GitPullRequest size={32} className="mx-auto mb-2 opacity-30" />
                <p>No pull requests yet.</p>
              </div>
            ) : prs.slice(0, 5).map(pr => {
              const cfg = statusConfig[pr.status] || statusConfig.open;
              const StatusIcon = cfg.icon;
              return (
                <div key={pr._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-all duration-150 cursor-pointer">
                  <StatusIcon size={16} className={cfg.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{pr.title}</p>
                    <p className="text-xs text-text-muted">by {pr.author?.username} · {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className={`status-badge ${cfg.color} ${cfg.bg}`}>{pr.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Activity size={16} className="text-accent-green" /> Activity Feed
        </h3>
        <div className="space-y-3">
          {[
            { icon: Zap, color: 'text-accent-purple', bg: 'bg-accent-purple/10', msg: 'Platform ready for collaboration', time: 'Just now' },
            { icon: Code2, color: 'text-accent-blue', bg: 'bg-accent-blue/10', msg: 'Monaco Editor configured with real-time sync', time: '1m ago' },
            { icon: Users, color: 'text-accent-green', bg: 'bg-accent-green/10', msg: 'Socket.IO server connected', time: '2m ago' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-hover transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                  <Icon size={14} className={item.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{item.msg}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
