import React, { useState } from 'react';
import { ARQRTarget, ARQRTargetAsset } from '../../types/arBook';
import { ARDatabase, audioKey, resolveAudioSource, voiceOf } from '../../services/db';
import { VOICE_LANGS, VoiceLang } from '../../types/arBook';
import { exportContentPack, importContentPack, saveFileToDevice } from '../../services/contentPack';
import { soundService } from '../../services/soundService';
import { GlbViewerPreview } from './GlbViewerPreview';
import { CloudPublishCard } from './CloudPublishCard';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Upload,
  RefreshCw,
  Box,
  X,
  Camera,
  CheckCircle,
  Music,
  Play,
  Square,
  QrCode,
  AlertCircle,
  Layers,
  Printer,
  PackageOpen,
  PackagePlus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface AdminPanelProps {
  targets: ARQRTarget[];
  onRefreshTargets: () => Promise<void>;
  onClose: () => void;
  onTestCamera: () => void;
  onOpenPrintModal: () => void;
}

interface PendingFile {
  data: ArrayBuffer;
  name: string;
}

const VOICE_LABELS: Record<VoiceLang, { flag: string; label: string }> = {
  id: { flag: '🇮🇩', label: 'Indonesia' },
  en: { flag: '🇬🇧', label: 'English' },
  tl: { flag: '🇵🇭', label: 'Tagalog' },
};

const GLB_ACCEPT = '.glb,model/gltf-binary,application/octet-stream';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  targets,
  onRefreshTargets,
  onClose,
  onTestCamera,
  onOpenPrintModal,
}) => {
  const [editingTarget, setEditingTarget] = useState<ARQRTarget | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<ARQRTarget | null>(null);

  // Files picked in the form; written to storage only when the sticker is saved
  const [pendingMain, setPendingMain] = useState<PendingFile | null>(null);
  const [pendingExtras, setPendingExtras] = useState<Record<string, PendingFile>>({});
  const [removedExtraIds, setRemovedExtraIds] = useState<string[]>([]);
  const [pendingVoices, setPendingVoices] = useState<Partial<Record<VoiceLang, PendingFile>>>({});
  const [removedVoices, setRemovedVoices] = useState<VoiceLang[]>([]);
  const [playingVoice, setPlayingVoice] = useState<VoiceLang | null>(null);

  const filteredTargets = targets.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNotice = (msg: string) => {
    setSaveNotice(msg);
    window.setTimeout(() => setSaveNotice(null), 4000);
  };

  const resetForm = () => {
    setPendingMain(null);
    setPendingExtras({});
    setRemovedExtraIds([]);
    setPendingVoices({});
    setRemovedVoices([]);
    setFormError(null);
    soundService.stopAudio();
    setPlayingVoice(null);
  };

  const closeForm = () => {
    resetForm();
    setEditingTarget(null);
  };

  const handleStartCreate = () => {
    const usedCodes = new Set(targets.map((t) => t.qrCode.trim().toLowerCase()));
    let nextNum = targets.length + 1;
    while (usedCodes.has(`vv-${String(nextNum).padStart(2, '0')}`)) nextNum++;
    resetForm();
    setEditingTarget({
      id: `target-${Date.now()}`,
      name: `Stiker 3D Halaman ${nextNum}`,
      qrCode: `VV-${String(nextNum).padStart(2, '0')}`,
      bookPage: nextNum,
      assets: [],
      modelScale: 1.0,
      elevationOffset: 0,
      voices: {},
      autoPlayAudio: true,
      source: 'local',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsCreatingNew(true);
  };

  const handleEdit = (target: ARQRTarget) => {
    resetForm();
    const copy: ARQRTarget = JSON.parse(JSON.stringify(target));
    // Legacy single voice becomes the Indonesian voice
    const legacy = voiceOf(copy, 'id');
    copy.voices = { ...(copy.voices || {}), ...(legacy ? { id: legacy } : {}) };
    delete copy.hasCustomAudio;
    delete copy.customAudioName;
    delete copy.audioUrl;
    setEditingTarget(copy);
    setIsCreatingNew(false);
  };

  const readFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<PendingFile | null> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return null;
    return { data: await file.arrayBuffer(), name: file.name };
  };

  const isGlb = (f: PendingFile) => {
    const head = new Uint8Array(f.data, 0, Math.min(4, f.data.byteLength));
    return String.fromCharCode(...head) === 'glTF';
  };

  // Big models are slow to download on kids' phones and fill up their storage
  const sizeWarning = (f: PendingFile) => {
    const mb = f.data.byteLength / 1048576;
    return mb > 15
      ? `Model ${mb.toFixed(1)} MB cukup berat. Disarankan kompres dulu (lihat docs/SUPABASE.md, bagian "Model ringan") agar cepat diunduh.`
      : null;
  };

  const handleGlbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = await readFile(e);
    if (!f || !editingTarget) return;
    if (!isGlb(f)) {
      setFormError('File bukan model .GLB yang valid. Ekspor model sebagai glTF Binary (.glb).');
      return;
    }
    setPendingMain(f);
    setEditingTarget({ ...editingTarget, customGlbFileName: f.name, customGlbUrl: undefined });
    setFormError(sizeWarning(f));
  };

  const handleAddExtraGlb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = await readFile(e);
    if (!f || !editingTarget) return;
    if (!isGlb(f)) {
      setFormError('File bukan model .GLB yang valid.');
      return;
    }
    const subId = `${editingTarget.id}_sub_${Date.now()}`;
    const asset: ARQRTargetAsset = { id: subId, name: f.name.replace(/\.[^/.]+$/, ''), fileName: f.name };
    setPendingExtras({ ...pendingExtras, [subId]: f });
    setEditingTarget({ ...editingTarget, assets: [...(editingTarget.assets || []), asset] });
    setFormError(sizeWarning(f));
  };

  const handleMoveExtraAsset = (index: number, dir: -1 | 1) => {
    if (!editingTarget?.assets) return;
    const list = [...editingTarget.assets];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setEditingTarget({ ...editingTarget, assets: list });
  };

  const handleRemoveExtraAsset = (assetId: string) => {
    if (!editingTarget) return;
    const rest = { ...pendingExtras };
    delete rest[assetId];
    setPendingExtras(rest);
    setRemovedExtraIds([...removedExtraIds, assetId]);
    setEditingTarget({ ...editingTarget, assets: (editingTarget.assets || []).filter((a) => a.id !== assetId) });
  };

  const handleVoiceUpload = async (lang: VoiceLang, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = await readFile(e);
    if (!f || !editingTarget) return;
    soundService.stopAudio();
    setPlayingVoice(null);
    setPendingVoices({ ...pendingVoices, [lang]: f });
    setRemovedVoices(removedVoices.filter((l) => l !== lang));
    setEditingTarget({ ...editingTarget, voices: { ...(editingTarget.voices || {}), [lang]: { name: f.name } } });
  };

  const handleVoiceRemove = (lang: VoiceLang) => {
    if (!editingTarget) return;
    soundService.stopAudio();
    setPlayingVoice(null);
    const pending = { ...pendingVoices };
    delete pending[lang];
    setPendingVoices(pending);
    setRemovedVoices([...removedVoices, lang]);
    const voices = { ...(editingTarget.voices || {}) };
    delete voices[lang];
    setEditingTarget({ ...editingTarget, voices });
  };

  const handleVoicePreview = async (lang: VoiceLang) => {
    soundService.stopAudio();
    if (playingVoice === lang) {
      setPlayingVoice(null);
      return;
    }
    if (!editingTarget) return;
    const src = pendingVoices[lang]?.data ?? (await resolveAudioSource(editingTarget, lang));
    if (src) {
      soundService.playManualAudio(src);
      setPlayingVoice(lang);
    }
  };

  const handleSave = async () => {
    if (!editingTarget) return;
    const code = (editingTarget.qrCode || '').trim();
    if (!code) {
      setFormError('Kode QR wajib diisi (misalnya: VV-01)');
      return;
    }
    const duplicate = targets.find((t) => t.id !== editingTarget.id && t.qrCode.trim().toLowerCase() === code.toLowerCase());
    if (duplicate) {
      setFormError(`Kode QR "${code}" sudah dipakai oleh "${duplicate.name}". Gunakan kode lain.`);
      return;
    }
    const url = (editingTarget.customGlbUrl || '').trim();
    const hasStoredModel = !isCreatingNew && !!(await ARDatabase.getAssetBlob(editingTarget.id));
    if (!pendingMain && !url && !hasStoredModel) {
      setFormError('Unggah file model 3D .GLB atau isi tautan online .GLB terlebih dahulu.');
      return;
    }

    setIsBusy(true);
    setFormError(null);
    try {
      let mirrorWarning = '';
      if (pendingMain) {
        await ARDatabase.saveAssetBlob(editingTarget.id, pendingMain.data, pendingMain.name);
      } else if (url.startsWith('http')) {
        // Download the online model once so it also works offline
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(String(res.status));
          await ARDatabase.saveAssetBlob(editingTarget.id, await res.arrayBuffer(), editingTarget.customGlbFileName || `${editingTarget.id}.glb`);
        } catch {
          mirrorWarning = ' (Tautan GLB belum bisa diunduh untuk mode offline — periksa tautan / koneksi.)';
        }
      }
      for (const [id, f] of Object.entries(pendingExtras)) {
        await ARDatabase.saveAssetBlob(id, f.data, f.name);
      }
      if (removedExtraIds.length > 0) await ARDatabase.deleteStoredFiles(removedExtraIds);
      for (const [lang, f] of Object.entries(pendingVoices) as Array<[VoiceLang, PendingFile]>) {
        await ARDatabase.saveAudioBlob(editingTarget.id, f.data, f.name, undefined, lang);
      }
      if (removedVoices.length > 0) await ARDatabase.deleteAssetKeys(removedVoices.map((l) => audioKey(editingTarget.id, l)));

      await ARDatabase.saveTarget({
        ...editingTarget,
        name: (editingTarget.name || '').trim() || `Stiker ${code}`,
        qrCode: code,
        customGlbUrl: url || undefined,
        // Edited on this device: keep it, even if a content pack ships the same sticker
        source: 'local',
      });
      await onRefreshTargets();
      showNotice(`Stiker QR tersimpan & siap dipakai offline.${mirrorWarning}`);
      closeForm();
    } catch (err) {
      console.error('Save error:', err);
      setFormError('Gagal menyimpan. Pastikan memori perangkat cukup lalu coba lagi.');
    } finally {
      setIsBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await ARDatabase.deleteTarget(deleteTarget);
    await onRefreshTargets();
    setDeleteTarget(null);
    showNotice('Stiker QR berhasil dihapus');
  };

  const handleExport = async () => {
    if (targets.length === 0) return;
    setIsBusy(true);
    try {
      const zip = await exportContentPack(targets);
      const date = new Date().toISOString().slice(0, 10);
      const where = await saveFileToDevice(zip, `vinu-veti-konten-${date}.zip`);
      showNotice(`Paket konten disimpan: ${where}`);
    } catch (e) {
      console.error(e);
      showNotice(e instanceof Error ? `Ekspor gagal: ${e.message}` : 'Ekspor gagal');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsBusy(true);
    try {
      const count = await importContentPack(file);
      await onRefreshTargets();
      showNotice(`${count} stiker berhasil diimpor.`);
    } catch (err) {
      showNotice(err instanceof Error ? `Impor gagal: ${err.message}` : 'Impor gagal');
    } finally {
      setIsBusy(false);
    }
  };

  const modelLabel = (t: ARQRTarget) => {
    const extra = t.assets?.length || 0;
    if (extra > 0) return `${1 + extra} gerakan (sentuh karakter untuk ganti)`;
    return t.customGlbFileName || 'Model .GLB';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white flex flex-col overflow-hidden">
      <div className="pt-10 sm:pt-12 pb-3.5 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 shrink-0 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white border border-slate-600 flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            <X className="w-4 h-4 text-emerald-400" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenPrintModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/10 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cetak QR</span>
            </button>
            <button
              onClick={handleStartCreate}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Stiker</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 shrink-0">
              <img src="./app-icon.png" alt="" className="w-full h-full rounded-lg" />
            </div>
            <h2 className="font-bold text-sm sm:text-base text-white tracking-wide truncate">Kelola Stiker & Model 3D</h2>
          </div>
          <span className="text-xs text-slate-400 shrink-0">
            Total: <strong className="text-white">{targets.length}</strong>
          </span>
        </div>
      </div>

      {saveNotice && (
        <div className="bg-emerald-600/95 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {saveNotice}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <input
          type="text"
          placeholder="Cari nama stiker atau kode QR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-4 bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
        />

        {filteredTargets.length === 0 ? (
          <div className="py-14 px-4 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/40">
            <QrCode className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-sm text-slate-200 mb-1">Belum Ada Stiker QR</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
              Buat stiker QR, unggah model 3D .GLB, lalu cetak QR-nya dan tempel di buku.
            </p>
            <button
              onClick={handleStartCreate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Buat Stiker QR Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTargets.map((t) => (
              <div key={t.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {t.bookPage ? `Hal. ${t.bookPage}` : 'Stiker QR'}
                      {t.source === 'pack' ? ' · Paket' : ''}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-300 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                      {t.qrCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{t.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 my-2">
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md border border-white/5 max-w-full truncate">
                      <Box className="w-3 h-3 text-emerald-400 shrink-0" />
                      {modelLabel(t)}
                    </span>
                    {VOICE_LANGS.some((l) => voiceOf(t, l)) && (
                      <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                        <Music className="w-3 h-3" />
                        Suara: {VOICE_LANGS.filter((l) => voiceOf(t, l)).map((l) => VOICE_LABELS[l].flag).join(' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-1 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={onTestCamera}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Uji dengan Kamera
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(t)} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CloudPublishCard targets={targets} />

        {/* Offline content pack: backup / content bundled inside the APK */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div>
            <h4 className="text-xs font-bold text-white">Cadangan & Konten Bawaan APK</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Ekspor .zip untuk cadangan, memindahkan stiker ke perangkat admin lain, atau dimasukkan ke
              web-app/public/content agar sudah ada sejak aplikasi pertama diinstal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              disabled={isBusy || targets.length === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10"
            >
              {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />}
              Ekspor Paket Konten
            </button>
            <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10">
              <PackagePlus className="w-3.5 h-3.5 text-emerald-400" />
              Impor Paket Konten
              <input type="file" accept=".zip,application/zip" onChange={handleImport} className="hidden" disabled={isBusy} />
            </label>
          </div>
        </div>
      </div>

      {/* Create / edit form */}
      {editingTarget && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 sm:p-5 pt-12 sm:pt-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-white">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-white">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>{isCreatingNew ? 'Tambah Stiker QR & Model 3D' : 'Edit Stiker QR & Model 3D'}</span>
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-full text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-600/90 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <GlbViewerPreview target={editingTarget} customBlobData={pendingMain?.data ?? null} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Nama / Label Stiker</label>
                  <input
                    type="text"
                    value={editingTarget.name}
                    onChange={(e) => setEditingTarget({ ...editingTarget, name: e.target.value })}
                    placeholder="Contoh: Halaman 1 - Vinu Bernyanyi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Halaman Buku</label>
                  <input
                    type="number"
                    min={1}
                    value={editingTarget.bookPage ?? ''}
                    onChange={(e) =>
                      setEditingTarget({ ...editingTarget, bookPage: e.target.value ? parseInt(e.target.value, 10) : undefined })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-400 block mb-1">Kode Teks QR (dicetak pada stiker) *</label>
                  <input
                    type="text"
                    value={editingTarget.qrCode}
                    onChange={(e) => setEditingTarget({ ...editingTarget, qrCode: e.target.value })}
                    placeholder="Contoh: VV-01"
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Jika kode diubah, cetak ulang stiker QR-nya.</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  Karakter & Animasi (.GLB)
                </span>
                <p className="text-[10px] text-slate-400 -mt-1 leading-relaxed">
                  Gerakan 1 = file utama. Tambahkan file .GLB lain dari karakter yang sama dengan gerakan berbeda:
                  di kamera AR, anak cukup <strong className="text-emerald-300">menyentuh karakternya</strong> untuk
                  berganti ke gerakan berikutnya (tanpa tombol, QR tetap sama).
                </p>

                <div className="border border-dashed border-emerald-500/40 rounded-xl p-3 bg-emerald-500/5 text-center">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <label className="cursor-pointer">
                    <span className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-block shadow-md">
                      Pilih File .GLB Gerakan 1 (Utama)
                    </span>
                    <input type="file" accept={GLB_ACCEPT} onChange={handleGlbUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {editingTarget.customGlbFileName ? (
                      <span className="text-emerald-300 font-semibold">
                        {editingTarget.customGlbFileName}
                        {pendingMain ? ` (${(pendingMain.data.byteLength / 1048576).toFixed(1)} MB, belum disimpan)` : ''}
                      </span>
                    ) : (
                      'Animasi di dalam file .GLB akan otomatis diputar'
                    )}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 font-medium block mb-1">
                      Atau tautan online .GLB (diunduh sekali, lalu bisa dibuka offline):
                    </span>
                    <input
                      type="url"
                      placeholder="https://.../model.glb"
                      value={editingTarget.customGlbUrl || ''}
                      onChange={(e) => setEditingTarget({ ...editingTarget, customGlbUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Gerakan berikutnya (urutan saat karakter disentuh)
                    </span>
                    <label className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] rounded-lg font-medium border border-white/10 flex items-center gap-1 shrink-0">
                      <Plus className="w-3 h-3" />
                      Tambah Gerakan
                      <input type="file" accept={GLB_ACCEPT} onChange={handleAddExtraGlb} className="hidden" />
                    </label>
                  </div>
                  {editingTarget.assets && editingTarget.assets.length > 0 ? (
                    <div className="space-y-1.5">
                      {editingTarget.assets.map((asset, i) => (
                        <div key={asset.id} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                          <span className="truncate text-slate-300">
                            Gerakan {i + 2}: <strong>{asset.fileName}</strong>
                          </span>
                          <div className="flex items-center shrink-0">
                            <button
                              type="button"
                              disabled={i === 0}
                              onClick={() => handleMoveExtraAsset(i, -1)}
                              className="text-slate-400 hover:text-emerald-300 disabled:opacity-30 p-1"
                              title="Naikkan urutan"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={i === editingTarget.assets!.length - 1}
                              onClick={() => handleMoveExtraAsset(i, 1)}
                              className="text-slate-400 hover:text-emerald-300 disabled:opacity-30 p-1"
                              title="Turunkan urutan"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => handleRemoveExtraAsset(asset.id)} className="text-slate-400 hover:text-rose-400 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">Opsional. Belum ada gerakan tambahan.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <div>
                    <span>Ukuran di atas QR ({editingTarget.modelScale.toFixed(1)}x)</span>
                    <input
                      type="range"
                      min="0.3"
                      max="3"
                      step="0.1"
                      value={editingTarget.modelScale}
                      onChange={(e) => setEditingTarget({ ...editingTarget, modelScale: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 mt-1"
                    />
                  </div>
                  <div>
                    <span>Ketinggian di atas QR ({editingTarget.elevationOffset.toFixed(2)})</span>
                    <input
                      type="range"
                      min="-0.5"
                      max="1"
                      step="0.05"
                      value={editingTarget.elevationOffset}
                      onChange={(e) => setEditingTarget({ ...editingTarget, elevationOffset: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    Suara Narasi 3 Bahasa (opsional)
                  </span>
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTarget.autoPlayAudio ?? true}
                      onChange={(e) => setEditingTarget({ ...editingTarget, autoPlayAudio: e.target.checked })}
                      className="accent-sky-500 rounded"
                    />
                    Putar saat karakter muncul
                  </label>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Satu suara per bahasa. Anak mendengar suara sesuai bahasa yang dipilih di aplikasi, saat karakter
                  muncul di layar AR.
                </p>
                {VOICE_LANGS.map((lang) => {
                  const voice = editingTarget.voices?.[lang];
                  return (
                    <div key={lang} className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 overflow-hidden text-xs min-w-0">
                        <span className="text-base shrink-0" title={VOICE_LABELS[lang].label}>{VOICE_LABELS[lang].flag}</span>
                        <label className="cursor-pointer px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-semibold shrink-0">
                          {voice ? 'Ganti' : 'Pilih'}
                          <input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" onChange={(e) => handleVoiceUpload(lang, e)} className="hidden" />
                        </label>
                        <span className="text-[11px] text-slate-300 truncate">
                          {voice ? voice.name : `Belum ada suara ${VOICE_LABELS[lang].label}`}
                          {pendingVoices[lang] ? ' (belum disimpan)' : ''}
                        </span>
                      </div>
                      {voice && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleVoicePreview(lang)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center gap-1 text-[10px]"
                          >
                            {playingVoice === lang ? <Square className="w-3 h-3 fill-sky-400" /> : <Play className="w-3 h-3 fill-sky-400" />}
                            {playingVoice === lang ? 'Stop' : 'Tes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVoiceRemove(lang)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                            title="Hapus suara"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <button type="button" onClick={closeForm} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isBusy}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95"
              >
                {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Simpan Stiker QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center">
            <h4 className="font-bold text-sm text-white mb-2">Hapus "{deleteTarget.name}"?</h4>
            <p className="text-xs text-slate-400 mb-4">File model 3D dan audio stiker ini akan dihapus dari perangkat.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold">
                Batal
              </button>
              <button onClick={confirmDelete} className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
