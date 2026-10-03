import React, { useState } from 'react';
import { CloudUpload, LogOut, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { ARQRTarget } from '../../types/arBook';
import { CLOUD_PUBLISH_ENABLED } from '../../services/cloudConfig';
import { cloudLogin, cloudLogout, getCloudUser, publishToCloud, PublishProgress } from '../../services/cloudPublish';

interface CloudPublishCardProps {
  targets: ARQRTarget[];
}

const LAST_PUBLISH_KEY = 'vv_last_publish';

export const CloudPublishCard: React.FC<CloudPublishCardProps> = ({ targets }) => {
  const [user, setUser] = useState<string | null>(getCloudUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<PublishProgress | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastPublish, setLastPublish] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_PUBLISH_KEY);
    } catch {
      return null;
    }
  });

  if (!CLOUD_PUBLISH_ENABLED) {
    return (
      <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 text-[11px] text-slate-300 leading-relaxed">
        <h4 className="text-xs font-bold text-amber-300 mb-1">Publikasi Online belum diatur</h4>
        Isi <code className="text-emerald-300">VITE_SUPABASE_URL</code> dan <code className="text-emerald-300">VITE_SUPABASE_ANON_KEY</code> di
        file <code>web-app/.env</code>, lalu build ulang. Panduan lengkap ada di <code>docs/SUPABASE.md</code>.
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      setUser(await cloudLogin(email, password));
      setPassword('');
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Login gagal' });
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (targets.length === 0) return;
    setBusy(true);
    setMessage(null);
    setProgress({ done: 0, uploaded: 0, skipped: 0 });
    try {
      const result = await publishToCloud(targets, setProgress);
      const when = new Date().toLocaleString('id-ID');
      try {
        localStorage.setItem(LAST_PUBLISH_KEY, when);
      } catch {
        // ignore
      }
      setLastPublish(when);
      setMessage({
        ok: true,
        text: `Terpublikasi! ${result.uploaded} file diunggah, ${result.skipped} file tidak berubah (dilewati). HP pengguna akan mengunduh perubahan saat online.`,
      });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Publikasi gagal' });
      if (!getCloudUser()) setUser(null);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
      <div>
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
          <CloudUpload className="w-4 h-4 text-emerald-400" />
          Publikasi Online (semua pengguna Play Store)
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
          Semua stiker di daftar ini dikirim ke server. Aplikasi di HP anak otomatis mengunduh yang berubah saja ketika
          online, lalu bisa dipakai offline. Stiker yang dihapus di sini juga terhapus di HP anak.
        </p>
        {lastPublish && <p className="text-[10px] text-emerald-300 mt-1">Terakhir dipublikasikan: {lastPublish}</p>}
      </div>

      {message && (
        <div
          className={`px-3 py-2 rounded-xl text-[11px] font-semibold flex items-start gap-2 ${
            message.ok ? 'bg-emerald-600/30 text-emerald-200' : 'bg-rose-600/30 text-rose-200'
          }`}
        >
          {message.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {!user ? (
        <form onSubmit={handleLogin} className="space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email akun publikasi"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            {busy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Login
          </button>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="truncate">Masuk sebagai {user}</span>
            <button
              onClick={() => {
                cloudLogout();
                setUser(null);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
          <button
            onClick={handlePublish}
            disabled={busy || targets.length === 0}
            className="w-full px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            {busy && progress
              ? `Memproses ${progress.current ?? ''} · ${progress.uploaded} diunggah, ${progress.skipped} dilewati`
              : `Publikasikan ${targets.length} Stiker`}
          </button>
        </div>
      )}
    </div>
  );
};
