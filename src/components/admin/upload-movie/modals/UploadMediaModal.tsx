// src/components/admin/upload-movie/modals/UploadMediaModal.tsx
import { useState, useEffect } from 'react';
import { XMarkIcon, VideoCameraIcon, PhotoIcon, CloudArrowUpIcon, DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';

interface UploadMediaModalProps {
  isOpen: boolean;
  isSaving: boolean;
  
  // Props baru untuk status multi-upload
  currentFileIndex: number;
  totalFilesToUpload: number;
  uploadProgress: number;
  
  processingStatus: string;
  onClose: () => void;
  // Submit sekarang mengirim Array File
  onSubmit: (type: 'VIDEO' | 'PHOTO', files: File[]) => void;
}

export default function UploadMediaModal({ 
  isOpen, 
  isSaving, 
  uploadProgress, 
  currentFileIndex, 
  totalFilesToUpload,
  processingStatus, 
  onClose, 
  onSubmit 
}: UploadMediaModalProps) {
  
  const [type, setType] = useState<'VIDEO' | 'PHOTO'>('VIDEO');
  const [files, setFiles] = useState<File[]>([]);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen && !isSaving) {
      setFiles([]);
    }
  }, [isOpen, isSaving]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Gabungkan file baru dengan file yg sudah ada (bisa nambah terus)
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    onSubmit(type, files);
  };

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      
      <div className="relative bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-bold text-white">
            {isSaving ? 'Sedang Mengupload...' : 'Upload Media (Multi-File)'}
          </h3>
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
          // --- TAMPILAN SAAT PROSES UPLOAD BERJALAN ---
          <div className="py-8 text-center space-y-6 flex-1 flex flex-col justify-center">
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
                File {currentFileIndex} dari {totalFilesToUpload}
              </h4>
              <p className="text-zinc-400 font-mono text-sm">
                 {processingStatus === 'compressing' ? 'Memproses di Server...' : `Uploading: ${uploadProgress}%`}
              </p>
              
              {/* Progress Bar Single File */}
              <div className="w-full bg-zinc-800 rounded-full h-4 mt-4 overflow-hidden border border-zinc-700 relative">
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold z-10 text-white drop-shadow-md">
                    {uploadProgress}%
                 </div>
                 <div 
                    className="bg-red-600 h-full rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
              </div>

              <p className="text-zinc-500 text-xs mt-4">
                Mohon jangan tutup halaman ini sampai semua file selesai.
              </p>
            </div>
          </div>
        ) : (
          // --- TAMPILAN FORM INPUT ---
          <form onSubmit={handleSubmit} className="space-y-5 flex flex-col flex-1 min-h-0">
            
            {/* Type Selector */}
            <div className="shrink-0">
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

            {/* File Input Area */}
            <div className="shrink-0">
               <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider text-center">Pilih File (Bisa Banyak)</label>
               <div 
                  className="relative h-28 bg-black border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:bg-zinc-900/50" 
                  onClick={() => document.getElementById('mediaInput')?.click()}
               >
                  <CloudArrowUpIcon className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-zinc-500 font-bold text-xs uppercase">Klik untuk tambah file</p>
                  <input 
                    id="mediaInput" 
                    type="file" 
                    multiple // <--- KUNCI MULTI UPLOAD
                    accept={type === 'VIDEO' ? "video/*" : "image/*"} 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
               </div>
            </div>

            {/* File List (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/50 rounded-xl border border-zinc-800 p-2 min-h-[150px]">
               {files.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                   Belum ada file dipilih
                 </div>
               ) : (
                 <div className="space-y-2">
                   {files.map((f, i) => (
                     <div key={i} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-2 bg-black rounded-md text-zinc-400">
                          {type === 'VIDEO' ? <VideoCameraIcon className="w-5 h-5"/> : <PhotoIcon className="w-5 h-5"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{f.name}</p>
                          <p className="text-zinc-500 text-xs">{formatFileSize(f.size)}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(i)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 shrink-0 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={files.length === 0}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload {files.length > 0 ? `(${files.length} File)` : ''}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}