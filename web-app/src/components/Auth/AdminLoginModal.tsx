import React, { useState } from 'react';
import { Lock, Mail, Key, X, AlertCircle, RefreshCw } from 'lucide-react';
import { CLOUD_PUBLISH_ENABLED } from '../../services/cloudConfig';
import { cloudLogin } from '../../services/cloudPublish';

interface AdminLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * Admin login with the Supabase admin account (public sign-ups are disabled in Supabase, so only the
 * accounts created in the dashboard can get in). The same session is used to publish content.
 * Without Supabase configured (local development only) it falls back to admin / admin.
 */
export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!CLOUD_PUBLISH_ENABLED) {
      if (email.trim().toLowerCase() === 'admin' && password === 'admin') {
        sessionStorage.setItem('ar_admin_auth', 'true');
        onSuccess();
      } else {
        setError('Login salah. (Mode lokal tanpa Supabase: admin / admin)');
      }
      return;
    }

    setBusy(true);
    try {
      await cloudLogin(email, password);
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Tidak ada koneksi internet. Login admin butuh internet.'
          : err instanceof Error && /invalid/i.test(err.message)
            ? 'Email atau password salah.'
            : err instanceof Error
              ? err.message
              : 'Login gagal'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Mode Pengembang</h3>
              <p className="text-[11px] text-slate-400">Khusus admin pembuat konten</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Email admin</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={CLOUD_PUBLISH_ENABLED ? 'email' : 'text'}
                autoFocus
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={CLOUD_PUBLISH_ENABLED ? 'nama@email.com' : 'admin'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 flex items-center gap-1.5"
            >
              {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
