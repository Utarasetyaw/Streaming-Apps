// src/components/admin/upload-movie/modals/UploadMediaModal.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon, VideoCameraIcon, PhotoIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';

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

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setName('');
      setFile(null);
      // Default type tetap VIDEO atau bisa direset jika mau
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-fill nama file jika input nama masih kosong
      if (!name) {
        // Hapus ekstensi file (contoh: "movie.mp4" -> "movie")
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setName(nameWithoutExt);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(name, type, file);
  };

  // Helper untuk format ukuran file (KB, MB, GB)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Upload Media</h3>
          <button 
            onClick={() => !isSaving && onClose()} 
            className={`text-zinc-500 hover:text-white ${isSaving ? 'opacity-30 cursor-not-allowed' : ''}`} 
            disabled={isSaving}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {isSaving ? (
          // TAMPILAN SAAT UPLOAD/PROCESSING
          <div className="py-8 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              {processingStatus === 'compressing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-zinc-800 rounded-full w-full h-full flex items-center justify-center animate-pulse border border-zinc-700">
                  <CloudArrowUpIcon className="w-12 h-12 text-red-500" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">
                {processingStatus === 'compressing' 
                  ? 'Memproses File...' 
                  : `Mengupload... ${uploadProgress}%`}
              </h4>
              <p className="text-zinc-500 text-sm px-4">
                {processingStatus === 'compressing' 
                  ? 'Sedang menyimpan file ke server. Jangan tutup halaman.' 
                  : 'Mohon tunggu, kecepatan tergantung koneksi internet Anda.'}
              </p>
              
              {/* Progress Bar */}
              {processingStatus === 'uploading' && (
                <div className="w-full bg-zinc-800 rounded-full h-3 mt-4 overflow-hidden border border-zinc-700">
                  <div 
                    className="bg-red-600 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-1" 
                    style={{ width: `${uploadProgress}%` }}
                  >
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // TAMPILAN FORM INPUT
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Tipe File</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setType('VIDEO')} 
                  className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${type === 'VIDEO' ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                >
                  <VideoCameraIcon className="w-5 h-5" /> Video
                </button>
                <button 
                  type="button" 
                  onClick={() => setType('PHOTO')} 
                  className={`py-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${type === 'PHOTO' ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                >
                  <PhotoIcon className="w-5 h-5" /> Foto
                </button>
              </div>
            </div>

            {/* File Input (Area Besar) */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase text-center tracking-wider">Pilih File</label>
              <div 
                className={`relative h-36 bg-black border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all group ${file ? 'border-red-600 bg-red-600/5' : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50'}`} 
                onClick={() => document.getElementById('mediaInput')?.click()}
              >
                {file ? (
                  <div className="text-center animate-in zoom-in-50 duration-200">
                    <DocumentIcon className="w-10 h-10 text-red-500 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm truncate max-w-[250px]">{file.name}</p>
                    <p className="text-zinc-500 text-xs mt-1 bg-zinc-900/80 px-2 py-0.5 rounded-full inline-block">{formatFileSize(file.size)}</p>
                  </div>
                ) : (
                  <div className="text-center group-hover:scale-105 transition duration-300">
                    <CloudArrowUpIcon className="w-10 h-10 text-zinc-700 mx-auto mb-2 group-hover:text-zinc-500" />
                    <p className="text-zinc-500 font-bold text-xs uppercase group-hover:text-zinc-400">Klik untuk cari file</p>
                    <p className="text-zinc-700 text-[10px] mt-1">{type === 'VIDEO' ? 'MP4, MKV, WebM' : 'JPG, PNG, WebP'}</p>
                  </div>
                )}
                <input 
                  id="mediaInput" 
                  type="file" 
                  accept={type === 'VIDEO' ? "video/*" : "image/*"} 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </div>
            </div>
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Judul File</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition placeholder-zinc-700" 
                placeholder={type === 'VIDEO' ? "Contoh: Episode 1" : "Contoh: Poster Alternatif"} 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition active:scale-95"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={!file}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}