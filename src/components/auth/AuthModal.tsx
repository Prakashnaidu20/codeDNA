import React, { useState } from 'react';
import { ShieldCheck, X, LogIn, UserPlus, Lock, Mail, User, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('admin@codedna.io');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Architect' | 'Senior Engineer' | 'Lead Maintainer' | 'Contributor'>('Senior Engineer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleFillDemoAdmin = () => {
    setIsLoginTab(true);
    setEmail('admin@codedna.io');
    setPassword('Password123!');
    setError(null);
  };

  const handleFillDemoEngineer = () => {
    setIsLoginTab(true);
    setEmail('marcus@codedna.io');
    setPassword('Password123!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (!isLoginTab && !name.trim()) {
      setError('Please enter your full name for account creation.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await signup(email, password, name, role);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="font-['Cabinet_Grotesk'] font-bold text-base text-slate-100">
              {isLoginTab ? 'Sign In to CodeDNA' : 'Create New CodeDNA Account'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-center font-bold rounded-lg transition-colors ${
              isLoginTab ? 'bg-slate-800 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-center font-bold rounded-lg transition-colors ${
              !isLoginTab ? 'bg-slate-800 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required={!isLoginTab}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@codedna.io"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Engineering Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="Senior Engineer">Senior Engineer</option>
                <option value="Architect">Architect</option>
                <option value="Lead Maintainer">Lead Maintainer</option>
                <option value="Contributor">Contributor</option>
              </select>
            </div>
          )}

          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">{error}</div>}

          {/* Preset Fill Buttons for Testing */}
          {isLoginTab && (
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Quick Demo Credentials:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleFillDemoAdmin}
                  className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-mono transition-colors text-left truncate"
                >
                  Admin: admin@codedna.io
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoEngineer}
                  className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-[11px] font-mono transition-colors text-left truncate"
                >
                  Dev: marcus@codedna.io
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm font-mono"
            >
              {isLoginTab ? <LogIn className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              <span>{isSubmitting ? 'Processing...' : isLoginTab ? 'Sign In' : 'Register Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
