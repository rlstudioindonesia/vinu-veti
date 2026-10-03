import React, { useState } from 'react';
import { ARQRTarget, ARQRTargetAsset } from '../../types/arBook';
import { ARDatabase } from '../../services/db';
import { realtimeSync } from '../../services/realtimeSync';
import { soundService } from '../../services/soundService';
import { GlbViewerPreview } from './GlbViewerPreview';
import { VinuVetiLogo } from '../Common/VinuVetiLogo';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Upload,
  RefreshCw,
  Box,
  X,
  Eye,
  CheckCircle,
  Music,
  Play,
  Square,
  QrCode,
  AlertCircle,
  Layers,
  Printer,
  ShieldCheck,
} from 'lucide-react';

interface AdminPanelProps {
  targets: ARQRTarget[];
  onRefreshTargets: () => Promise<void>;
  onClose: () => void;
  onPreviewAR: (target: ARQRTarget) => void;
  onOpenPrintModal: () => void;
  onOpenPrivacy?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  targets,
  onRefreshTargets,
  onClose,
  onPreviewAR,
  onOpenPrintModal,
  onOpenPrivacy,
}) => {
  const [editingTarget, setEditingTarget] = useState<ARQRTarget | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // File states
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileSize, setUploadFileSize] = useState<string>('');
  const [currentUploadedGlb, setCurrentUploadedGlb] = useState<ArrayBuffer | null>(null);

  // Audio states
  const [currentUploadedAudio, setCurrentUploadedAudio] = useState<ArrayBuffer | null>(null);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredTargets = targets.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCreate = () => {
    const nextNum = targets.length + 1;
    const newTarget: ARQRTarget = {
      id: `target-${Date.now()}`,
      name: `Stiker 3D Halaman ${nextNum}`,
      qrCode: `QR-${String(nextNum).padStart(2, '0')}`,
      bookPage: nextNum,
      description: '',
      modelType: 'custom_glb',
      assets: [],
      modelScale: 1.0,
      rotationSpeed: 0.0,
      elevationOffset: 0.1,
      accentColor: '#10b981',
      playAnimation: true,
      hasCustomAudio: false,
      autoPlayAudio: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditingTarget(newTarget);
    setIsCreatingNew(true);
    setUploadFileName('');
    setUploadFileSize('');
    setCurrentUploadedGlb(null);
    setCurrentUploadedAudio(null);
    setFormError(null);
  };

  const handleEdit = (target: ARQRTarget) => {
    setEditingTarget(JSON.parse(JSON.stringify(target)));
    setIsCreatingNew(false);
    setUploadFileName(target.customGlbFileName || 'File .GLB Utama');
    setUploadFileSize('');
    setCurrentUploadedGlb(null);
    setCurrentUploadedAudio(null);
    setFormError(null);
  };

  // Upload Primary GLB File
  const handleGlbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTarget) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      setFormError('Harap unggah file 3D berformat .glb atau .gltf');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      await ARDatabase.saveAssetBlob(editingTarget.id, arrayBuffer, file.name);
      setCurrentUploadedGlb(arrayBuffer);
      setEditingTarget({
        ...editingTarget,
        customGlbFileName: file.name,
      });
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadFileName(file.name);
      setUploadFileSize(`${sizeMB} MB`);
      setFormError(null);
      showNotice(`Model utama "${file.name}" (${sizeMB} MB) siap disimpan!`);
    } catch (err) {
      console.error(err);
      setFormError('Gagal memproses file .GLB');
    }
  };

  // Upload Additional GLB Asset for the same QR Sticker
  const handleAddExtraGlb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTarget) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      setFormError('Harap unggah file 3D berformat .glb atau .gltf');
      return;
    }

    try {
      const subId = `${editingTarget.id}_sub_${Date.now()}`;
      const arrayBuffer = await file.arrayBuffer();
      await ARDatabase.saveAssetBlob(subId, arrayBuffer, file.name);
      const existingAssets = editingTarget.assets || [];
      const newAsset: ARQRTargetAsset = {
        id: subId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
      };
      setEditingTarget({
        ...editingTarget,
        assets: [...existingAssets, newAsset],
      });
      showNotice(`Aset "${file.name}" berhasil ditambahkan ke QR ini!`);
    } catch (err) {
      console.error(err);
      setFormError('Gagal menambahkan aset tambahan');
    }
  };

  const handleRemoveExtraAsset = (assetId: string) => {
    if (!editingTarget) return;
    const remaining = (editingTarget.assets || []).filter((a) => a.id !== assetId);
    setEditingTarget({
      ...editingTarget,
      assets: remaining,
    });
  };

  // Upload Manual Audio File (.mp3, .wav)
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTarget) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await ARDatabase.saveAudioBlob(editingTarget.id, arrayBuffer, file.name);
      setCurrentUploadedAudio(arrayBuffer);
      setEditingTarget({
        ...editingTarget,
        hasCustomAudio: true,
        customAudioName: file.name,
      });
      setFormError(null);
      showNotice(`Audio "${file.name}" berhasil diunggah!`);
    } catch (err) {
      console.error(err);
      setFormError('Gagal menyimpan file audio');
    }
  };

  const handleToggleAudioPreview = () => {
    if (isPlayingAudioPreview) {
      soundService.stopAudio();
      setIsPlayingAudioPreview(false);
    } else {
      if (currentUploadedAudio) {
        soundService.playManualAudio(currentUploadedAudio);
        setIsPlayingAudioPreview(true);
      } else if (editingTarget) {
        ARDatabase.getAudioBlob(editingTarget.id).then((blob) => {
          if (blob) {
            soundService.playManualAudio(blob);
            setIsPlayingAudioPreview(true);
          }
        });
      }
    }
  };

  // Save Target
  const handleSave = async () => {
    if (!editingTarget) return;
    const trimmedCode = (editingTarget.qrCode || '').trim();
    const trimmedName = (editingTarget.name || '').trim();
    if (!trimmedCode) {
      setFormError('Kode QR wajib diisi (misalnya: QR-01)');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      const toSave: ARQRTarget = {
        ...editingTarget,
        name: trimmedName || `Stiker ${trimmedCode}`,
        qrCode: trimmedCode,
        rotationSpeed: 0,
      };
      await ARDatabase.saveTarget(toSave);
      realtimeSync.broadcast(
        isCreatingNew ? 'TARGET_CREATED' : 'TARGET_UPDATED',
        toSave.id
      );
      await onRefreshTargets();
      setIsSaving(false);
      showNotice('Stiker QR & Model 3D berhasil disimpan!');
      setEditingTarget(null);
    } catch (err) {
      setIsSaving(false);
      console.error('Save error:', err);
      setFormError('Gagal menyimpan. Silakan coba lagi.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await ARDatabase.deleteTarget(deleteTargetId);
      realtimeSync.broadcast('TARGET_DELETED', deleteTargetId);
      await onRefreshTargets();
      setDeleteTargetId(null);
      showNotice('Stiker QR berhasil dihapus');
    } catch (e) {
      console.error(e);
    }
  };

  const showNotice = (msg: string) => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="h-14 px-4 sm:px-6 bg-slate-900/90 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <X className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tutup</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 shrink-0">
              <VinuVetiLogo className="w-full h-full" showGlow={false} />
            </div>
            <h2 className="font-bold text-sm sm:text-base">Vinu Veti - Kelola Stiker</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold border border-white/10"
              title="Kebijakan Privasi"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Privasi</span>
            </button>
          )}
          <button
            onClick={onOpenPrintModal}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cetak Stiker QR</span>
          </button>
          <button
            onClick={handleStartCreate}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Stiker</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveNotice && (
        <div className="bg-emerald-600/95 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4" />
          {saveNotice}
        </div>
      )}

      {/* Main Targets Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Cari nama stiker atau kode QR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 flex-1 max-w-sm"
          />
          <span className="text-xs text-slate-400">
            Total: <strong className="text-white">{targets.length}</strong> stiker
          </span>
        </div>

        {filteredTargets.length === 0 ? (
          <div className="py-14 px-4 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/40">
            <QrCode className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="font-bold text-sm text-slate-200 mb-1">
              Belum Ada Stiker QR Terdaftar
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
              Tambahkan kode QR yang ingin ditempelkan pada buku, lalu unggah file model 3D .GLB Anda sendiri.
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
              <div
                key={t.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {t.bookPage ? `Hal. ${t.bookPage}` : 'Stiker QR'}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-300 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                      {t.qrCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{t.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 my-2">
                    <span className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">
                      <Box className="w-3 h-3 text-emerald-400" />
                      {t.assets && t.assets.length > 0
                        ? `${1 + t.assets.length} Model (Sentuh Objek di AR)`
                        : t.customGlbFileName || (t.modelType !== 'custom_glb' ? `${t.modelType.toUpperCase()} 3D` : 'File .GLB')}
                    </span>
                    {t.hasCustomAudio && (
                      <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                        <Music className="w-3 h-3" />
                        Audio Manual
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-1 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onPreviewAR(t);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Uji di Kamera AR
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(t.id)}
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
      </div>

      {/* Edit / Create QR Sticker Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                {isCreatingNew ? 'Tambah Stiker QR & Model 3D' : 'Edit Stiker QR & Model 3D'}
              </h3>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="bg-rose-600/90 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* 3D Live GLB Viewer with Animations */}
              <GlbViewerPreview
                target={editingTarget}
                customBlobData={currentUploadedGlb}
              />

              {/* QR & Sticker Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Nama / Label Stiker *
                  </label>
                  <input
                    type="text"
                    value={editingTarget.name}
                    onChange={(e) =>
                      setEditingTarget({ ...editingTarget, name: e.target.value })
                    }
                    placeholder="Contoh: Stiker Bab 1 Jantung"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Kode Teks QR (Yang Dicetak Pada Stiker) *
                  </label>
                  <input
                    type="text"
                    value={editingTarget.qrCode}
                    onChange={(e) =>
                      setEditingTarget({ ...editingTarget, qrCode: e.target.value })
                    }
                    placeholder="Contoh: QR-01 atau BIO-HEART"
                    className="w-full font-mono bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Model Type Selector */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Pilihan Tipe Model 3D Bawaan atau Unggah Sendiri (.GLB)
                </label>
                <select
                  value={editingTarget.modelType}
                  onChange={(e) =>
                    setEditingTarget({
                      ...editingTarget,
                      modelType: e.target.value as ARQRTarget['modelType'],
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="custom_glb">Upload File Model 3D Sendiri (.GLB / .GLTF)</option>
                  <option value="heart">Anatomi Jantung 3D Interaktif</option>
                  <option value="solar">Sistem Tata Surya 3D & Planet</option>
                  <option value="trex">Dinosaurus T-Rex 3D</option>
                  <option value="dna">Struktur DNA Helix Ganda 3D</option>
                  <option value="rocket">Roket Antariksa & Thruster 3D</option>
                </select>
              </div>

              {/* 3D GLB File Dropzone & Multiple Assets Support */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    Model 3D (.GLB) - Mendukung Banyak Aset di 1 QR
                  </span>
                  {uploadFileSize && (
                    <span className="text-[10px] text-slate-400">{uploadFileSize}</span>
                  )}
                </div>

                {/* Primary GLB File */}
                <div className="border border-dashed border-emerald-500/40 rounded-xl p-3 bg-emerald-500/5 text-center">
                  <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <label className="cursor-pointer">
                    <span className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-block shadow-md">
                      Pilih Model 3D .GLB Utama
                    </span>
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={handleGlbUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {uploadFileName ? (
                      <span className="text-emerald-300 font-semibold">
                        {uploadFileName}
                      </span>
                    ) : (
                      'Pilih model 3D .GLB Anda sendiri (animasi bawaan akan otomatis berputar)'
                    )}
                  </p>
                </div>

                {/* Additional assets attached to this QR */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Aset Tambahan untuk QR Ini (Sentuh Objek di Kamera AR untuk Beralih)
                    </span>
                    <label className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] rounded-lg font-medium border border-white/10 flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      + Tambah Aset
                      <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={handleAddExtraGlb}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {editingTarget.assets && editingTarget.assets.length > 0 ? (
                    <div className="space-y-1.5">
                      {editingTarget.assets.map((asset, i) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs"
                        >
                          <span className="truncate text-slate-300">
                            #{i + 2}: <strong>{asset.fileName}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraAsset(asset.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">
                      Opsional: Anda dapat mengunggah beberapa model sekaligus ke 1 QR. Di kamera AR, menyentuh objek 3D akan mengganti modelnya.
                    </p>
                  )}
                </div>

                {/* 3D Sliders */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <div>
                    <span>Skala Ukuran ({editingTarget.modelScale}x)</span>
                    <input
                      type="range"
                      min="0.3"
                      max="2.5"
                      step="0.1"
                      value={editingTarget.modelScale}
                      onChange={(e) =>
                        setEditingTarget({
                          ...editingTarget,
                          modelScale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500 mt-1"
                    />
                  </div>
                  <div>
                    <span>Ketinggian di Atas QR ({editingTarget.elevationOffset}m)</span>
                    <input
                      type="range"
                      min="-0.3"
                      max="0.8"
                      step="0.05"
                      value={editingTarget.elevationOffset}
                      onChange={(e) =>
                        setEditingTarget({
                          ...editingTarget,
                          elevationOffset: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Manual Audio File */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    Audio Suara Manual (.MP3, .WAV, .M4A)
                  </span>
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTarget.autoPlayAudio ?? true}
                      onChange={(e) =>
                        setEditingTarget({
                          ...editingTarget,
                          autoPlayAudio: e.target.checked,
                        })
                      }
                      className="accent-sky-500 rounded"
                    />
                    Putar Otomatis saat QR Dipindai
                  </label>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 overflow-hidden text-xs">
                    <label className="cursor-pointer px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shrink-0">
                      Pilih File Audio
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-300 truncate">
                      {editingTarget.customAudioName || 'Belum ada audio manual'}
                    </span>
                  </div>
                  {editingTarget.hasCustomAudio && (
                    <button
                      type="button"
                      onClick={handleToggleAudioPreview}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 shrink-0 flex items-center gap-1 text-[10px]"
                    >
                      {isPlayingAudioPreview ? (
                        <>
                          <Square className="w-3 h-3 fill-sky-400" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-sky-400" />
                          Tes Audio
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Simpan Stiker QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center">
            <h4 className="font-bold text-sm text-white mb-2">Hapus Stiker QR Ini?</h4>
            <p className="text-xs text-slate-400 mb-4">
              File model 3D .GLB dan audio terkait akan dihapus.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
