// src/components/admin/upload-movie/modals/UploadMediaModal.tsx
import { useState } from 'react';
import { XMarkIcon, VideoCameraIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface UploadMediaModalProps {
  isOpen: boolean;
  isSaving: boolean;
  uploadProgress: number;
  processingStatus: string;
  onClose: () => void;
  onSubmit: (name: string, type: 'VIDEO' | 'PHOTO', file: File) => void;
}

export default function UploadMediaModal({ isOpen, isSaving, uploadProgress, processingStatus, onClose, onSubmit }: UploadMediaModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'VIDEO' | 'PHOTO'>('VIDEO');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(name, type, file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Upload Media</h3>
          <button onClick={() => !isSaving && onClose()} className={`text-zinc-500 hover:text-white ${isSaving ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={isSaving}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isSaving ? (
          <div className="py-8 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              {processingStatus === 'compressing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-zinc-800 rounded-full w-full h-full flex items-center justify-center animate-pulse">
                  <CloudArrowUpIcon className="w-10 h-10 text-red-500" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">
                {processingStatus === 'compressing' ? 'Sedang Mengompres Video...' : `Mengupload... ${uploadProgress}%`}
              </h4>
              <p className="text-zinc-500 text-sm">
                {processingStatus === 'compressing' ? 'Mohon jangan tutup halaman ini.' : 'Pastikan koneksi internet stabil.'}
              </p>
              {processingStatus === 'uploading' && (
                <div className="w-full bg-zinc-800 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div className="bg-red-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Tipe File</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setType('VIDEO')} className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${type === 'VIDEO' ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-500'}`}><VideoCameraIcon className="w-5 h-5" /> Video</button>
                <button type="button" onClick={() => setType('PHOTO')} className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${type === 'PHOTO' ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-500'}`}><PhotoIcon className="w-5 h-5" /> Foto</button>
              </div>
            </div>
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Judul File</label>
              <input type="text" className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-red-600 outline-none" placeholder="Contoh: Episode 1" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* File Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase text-center">Pilih File</label>
              <div className="relative h-32 bg-black border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer" onClick={() => document.getElementById('mediaInput')?.click()}>
                <p className="text-zinc-400 font-bold text-xs truncate w-full text-center px-4">{file ? file.name : "KLIK UNTUK CARI FILE"}</p>
                <input id="mediaInput" type="file" accept={type === 'VIDEO' ? "video/*" : "image/*"} className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold">Batal</button>
              <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg">Upload</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}