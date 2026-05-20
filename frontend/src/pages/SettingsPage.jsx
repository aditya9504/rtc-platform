import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFontSize, setWordWrap, setMinimap } from '../redux/slices/editorSlice';
import { Settings, Code2, Bell, Shield, Palette, Monitor, Moon, Sun, Check, ChevronRight, Zap } from 'lucide-react';

const Section = ({ icon: Icon, title, children, color = 'text-accent-purple' }) => (
  <div className="glass-card p-5">
    <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-5 pb-4 border-b border-border">
      <Icon size={16} className={color} />{title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {desc && <p className="text-xs text-text-muted mt-0.5">{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${value ? 'bg-accent-purple' : 'bg-bg-hover border border-border'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
  </div>
);

const SelectRow = ({ label, options, value, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <p className="text-sm font-medium text-text-primary">{label}</p>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-bg-tertiary border border-border text-text-secondary text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-accent-purple/50">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const SliderRow = ({ label, min, max, step, value, onChange, unit = '' }) => (
  <div className="py-1">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <span className="text-sm text-accent-purple font-mono">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-bg-hover rounded-full appearance-none cursor-pointer accent-accent-purple" />
    <div className="flex justify-between text-[11px] text-text-dim mt-1">
      <span>{min}{unit}</span><span>{max}{unit}</span>
    </div>
  </div>
);

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { fontSize, wordWrap, minimap } = useSelector(s => s.editor);
  const [notifications, setNotifications] = useState({ sessionInvites: true, reviewRequests: true, prUpdates: true, comments: false, emailDigest: false });
  const [security, setSecurity] = useState({ twoFactor: false, sessionTimeout: '7d', publicProfile: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <p className="text-text-muted text-sm mt-1">Customize your RTC platform experience</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
          {saved ? <><Check size={14} /> Saved!</> : <><Zap size={14} /> Save Changes</>}
        </button>
      </div>

      <Section icon={Code2} title="Editor Settings">
        <SliderRow label="Font Size" min={10} max={24} step={1} value={fontSize} onChange={v => dispatch(setFontSize(v))} unit="px" />
        <SelectRow label="Word Wrap" value={wordWrap} onChange={v => dispatch(setWordWrap(v))}
          options={[{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }, { value: 'wordWrapColumn', label: 'At Column' }, { value: 'bounded', label: 'Bounded' }]} />
        <Toggle label="Minimap" desc="Show the code minimap on the right side" value={minimap} onChange={v => dispatch(setMinimap(v))} />
        <Toggle label="Font Ligatures" desc="Enable Fira Code ligatures for operators" value={true} onChange={() => {}} />
        <Toggle label="Bracket Pair Colorization" desc="Color matching brackets for better readability" value={true} onChange={() => {}} />
        <Toggle label="Auto Save" desc="Automatically save code every 2 seconds" value={true} onChange={() => {}} />
      </Section>

      <Section icon={Palette} title="Appearance" color="text-accent-blue">
        <div>
          <p className="text-sm font-medium text-text-primary mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {[{ id: 'dark', icon: Moon, label: 'Dark', active: true }, { id: 'darker', icon: Monitor, label: 'Darker', active: false }, { id: 'light', icon: Sun, label: 'Light', active: false }].map(t => (
              <button key={t.id} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${t.active ? 'bg-accent-purple/15 border-accent-purple/40 text-accent-purple' : 'bg-bg-tertiary border-border text-text-muted hover:border-accent-purple/20'}`}>
                <t.icon size={18} />
                <span className="text-xs font-medium">{t.label}</span>
                {t.active && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>
        <SelectRow label="UI Font" value="inter" onChange={() => {}}
          options={[{ value: 'inter', label: 'Inter (Default)' }, { value: 'system', label: 'System Default' }]} />
        <SelectRow label="Editor Font" value="firacode" onChange={() => {}}
          options={[{ value: 'firacode', label: 'Fira Code (Default)' }, { value: 'cascadia', label: 'Cascadia Code' }, { value: 'jetbrains', label: 'JetBrains Mono' }]} />
      </Section>

      <Section icon={Bell} title="Notifications" color="text-accent-green">
        <Toggle label="Session Invites" desc="Get notified when invited to a session" value={notifications.sessionInvites} onChange={v => setNotifications(p => ({ ...p, sessionInvites: v }))} />
        <Toggle label="Review Requests" desc="Notify when someone requests your review" value={notifications.reviewRequests} onChange={v => setNotifications(p => ({ ...p, reviewRequests: v }))} />
        <Toggle label="PR Updates" desc="Notify on pull request status changes" value={notifications.prUpdates} onChange={v => setNotifications(p => ({ ...p, prUpdates: v }))} />
        <Toggle label="Comments" desc="Notify on new comments on your work" value={notifications.comments} onChange={v => setNotifications(p => ({ ...p, comments: v }))} />
        <Toggle label="Email Digest" desc="Weekly activity summary via email" value={notifications.emailDigest} onChange={v => setNotifications(p => ({ ...p, emailDigest: v }))} />
      </Section>

      <Section icon={Shield} title="Security & Privacy" color="text-accent-red">
        <Toggle label="Two-Factor Authentication" desc="Extra layer of security for your account" value={security.twoFactor} onChange={v => setSecurity(p => ({ ...p, twoFactor: v }))} />
        <Toggle label="Public Profile" desc="Allow others to find your profile" value={security.publicProfile} onChange={v => setSecurity(p => ({ ...p, publicProfile: v }))} />
        <SelectRow label="Session Timeout" value={security.sessionTimeout} onChange={v => setSecurity(p => ({ ...p, sessionTimeout: v }))}
          options={[{ value: '1d', label: '1 Day' }, { value: '7d', label: '7 Days (Default)' }, { value: '30d', label: '30 Days' }, { value: 'never', label: 'Never' }]} />
        <div className="pt-2">
          <button className="text-sm text-accent-red hover:text-red-300 transition-colors flex items-center gap-1.5">
            <ChevronRight size={14} /> Delete Account
          </button>
        </div>
      </Section>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">RTC Code Review Platform</p>
            <p className="text-xs text-text-muted mt-0.5">Version 1.0.0 · Built with React + Socket.IO + Monaco</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-accent-green">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span>Up to date</span>
          </div>
        </div>
      </div>
    </div>
  );
}
