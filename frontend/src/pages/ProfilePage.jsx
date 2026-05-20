import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import {
  User, Github, Code2, Save, Loader2, Edit3,
  Star, GitPullRequest, MessageSquareCode, Users,
  Award, Calendar, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const SKILL_OPTIONS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js',
  'Vue', 'Angular', 'Go', 'Rust', 'Java', 'C++', 'C#',
  'GraphQL', 'REST APIs', 'Docker', 'Kubernetes', 'AWS', 'MongoDB'
];

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-4 text-center hover:border-accent-purple/30 transition-all">
    <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-xl font-bold text-text-primary">{value}</p>
    <p className="text-xs text-text-muted mt-0.5">{label}</p>
  </div>
);

export default function ProfilePage() {
  const { user, loading } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    bio: user?.bio || '',
    githubUrl: user?.githubUrl || '',
    skills: user?.skills || [],
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const res = await dispatch(updateProfile(form));
    if (!res.error) {
      toast.success('Profile updated!');
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(res.payload || 'Update failed');
    }
  };

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const stats = [
    { icon: Users, label: 'Sessions', value: user?.stats?.sessions || 0, color: 'bg-gradient-to-br from-accent-purple to-purple-700' },
    { icon: MessageSquareCode, label: 'Reviews', value: user?.stats?.reviews || 0, color: 'bg-gradient-to-br from-accent-blue to-blue-700' },
    { icon: GitPullRequest, label: 'Pull Requests', value: user?.stats?.pullRequests || 0, color: 'bg-gradient-to-br from-accent-green to-green-700' },
    { icon: Star, label: 'Contributions', value: user?.stats?.contributions || 0, color: 'bg-gradient-to-br from-accent-orange to-yellow-600' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 via-transparent to-accent-blue/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-glow">
              <span className="text-white text-3xl font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent-green border-2 border-bg-card" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">{user?.username}</h2>
                <p className="text-text-muted text-sm">{user?.email}</p>
              </div>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
              >
                {loading ? <Loader2 size={14} className="animate-spin" />
                  : saved ? <CheckCircle size={14} />
                  : editing ? <Save size={14} />
                  : <Edit3 size={14} />}
                {editing ? (loading ? 'Saving...' : 'Save') : 'Edit Profile'}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-text-muted">
              {user?.githubUrl && !editing && (
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-purple transition-colors">
                  <Github size={14} /><span>GitHub</span>
                </a>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Joined {user?.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'recently'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-5">
          {editing ? (
            <textarea className="input-field resize-none h-20 text-sm" placeholder="Tell others about yourself..."
              value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          ) : (
            <p className="text-text-secondary text-sm leading-relaxed">
              {user?.bio || <span className="text-text-dim italic">No bio yet. Click Edit to add one.</span>}
            </p>
          )}
        </div>
        {editing && (
          <div className="relative mt-3">
            <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="url" className="input-field pl-9 text-sm" placeholder="https://github.com/username"
              value={form.githubUrl} onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => <StatBadge key={s.label} {...s} />)}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Code2 size={16} className="text-accent-purple" /> Skills & Technologies
        </h3>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => (
              <button key={skill} onClick={() => toggleSkill(skill)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  form.skills.includes(skill)
                    ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/40'
                    : 'bg-bg-tertiary text-text-muted border-border hover:border-accent-purple/30'
                }`}>
                {skill}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(user?.skills?.length > 0 ? user.skills : []).map(skill => (
              <span key={skill} className="text-xs px-3 py-1.5 rounded-lg bg-accent-purple/10 text-accent-purple border border-accent-purple/20 font-medium">{skill}</span>
            ))}
            {(!user?.skills || user.skills.length === 0) && <p className="text-text-dim text-sm italic">No skills added yet.</p>}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Award size={16} className="text-accent-yellow" /> Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: '🚀', label: 'Early Adopter', desc: 'Joined in the first wave', earned: true },
            { icon: '💻', label: 'Code Wizard', desc: 'Ran 10+ code sessions', earned: (user?.stats?.sessions || 0) >= 10 },
            { icon: '🔍', label: 'Reviewer', desc: 'Completed 5 reviews', earned: (user?.stats?.reviews || 0) >= 5 },
            { icon: '🤝', label: 'Collaborator', desc: 'Joined 3+ sessions', earned: (user?.stats?.sessions || 0) >= 3 },
            { icon: '⭐', label: 'Contributor', desc: 'Made 20+ contributions', earned: (user?.stats?.contributions || 0) >= 20 },
            { icon: '🏆', label: 'Champion', desc: 'Merged 10 PRs', earned: (user?.stats?.pullRequests || 0) >= 10 },
          ].map(a => (
            <div key={a.label} className={`p-3 rounded-xl border transition-all ${a.earned ? 'bg-accent-yellow/5 border-accent-yellow/20' : 'bg-bg-tertiary border-border opacity-40'}`}>
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className={`text-xs font-semibold ${a.earned ? 'text-accent-yellow' : 'text-text-muted'}`}>{a.label}</p>
              <p className="text-[11px] text-text-dim mt-0.5">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
