// src/components/admin/upload-movie/UploadMovie.tsx
'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { ArrowLeftIcon, FolderPlusIcon } from '@heroicons/react/24/outline';

// Components & Types
import { Album, Category, MediaItem } from './types';
import FolderList from './FolderList';
import FolderDetail from './FolderDetail';
import CreateFolderModal from './modals/CreateFolderModal';
import UploadMediaModal from './modals/UploadMediaModal';
import PreviewModal from './modals/PreviewModal';
import AlertModal from './modals/AlertModal';
import ConfirmModal from './modals/ConfirmModal';

export default function UploadMovie() {
  // Data State
  const [folders, setFolders] = useState<Album[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload State
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  
  // Progress State (Multi Upload Support)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);

  // Notification State
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    fetchFolders();
    fetchCategories();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/albums');
      setFolders(await res.json());
    } catch(e) { console.error(e) } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      setCategories(await res.json());
    } catch(e) { console.error(e) }
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'error') => {
    setAlertConfig({ isOpen: true, title: type === 'success' ? 'Sukses' : 'Gagal', message, type });
  };

  const compressImage = async (file: File) => {
    try {
      return await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1280, useWebWorker: true });
    } catch { return file; }
  };

  // --- ACTIONS ---

  const handleCreateFolder = async (title: string, categoryIds: string[], thumbnail: File) => {
    setIsSaving(true);
    try {
      const compressed = await compressImage(thumbnail);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('categoryIds', JSON.stringify(categoryIds));
      formData.append('thumbnail', compressed);

      const res = await fetch('/api/albums', { method: 'POST', body: formData });
      if (res.ok) {
        await fetchFolders();
        setShowFolderModal(false);
        showAlert("Folder berhasil dibuat!", "success");
      } else throw new Error();
    } catch {
      showAlert("Gagal membuat folder.");
    } finally { setIsSaving(false); }
  };

  // --- REVISI: LOGIC MULTI UPLOAD SEQUENTIAL ---
  const handleUploadMedia = async (type: 'VIDEO' | 'PHOTO', files: File[]) => {
    if (!selectedFolder || files.length === 0) return;

    setIsSaving(true);
    setTotalFilesToUpload(files.length);
    setCurrentFileIndex(0);

    // Loop upload satu per satu (Sequential)
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i + 1); 
        setUploadProgress(0);
        setProcessingStatus('uploading');

        try {
            // Gunakan nama file asli (tanpa ekstensi) sebagai judul
            const name = file.name.replace(/\.[^/.]+$/, "");
            
            const fileToUpload = type === 'PHOTO' ? await compressImage(file) : file;
            
            const formData = new FormData();
            formData.append('name', name);
            formData.append('type', type);
            formData.append('albumId', selectedFolder.id.toString());
            formData.append('file', fileToUpload);

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/media');

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress(percent);
                        if (percent === 100) setProcessingStatus('compressing');
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const newItem = JSON.parse(xhr.responseText);
                        setSelectedFolder(prev => prev ? ({ ...prev, mediaItems: [...prev.mediaItems, newItem] }) : null);
                        resolve(newItem);
                    } else {
                        reject(xhr.responseText);
                    }
                };

                xhr.onerror = () => reject(xhr.statusText);
                xhr.send(formData);
            });

        } catch (error) {
            console.error(`Gagal upload file ke-${i + 1}:`, error);
        }
    }

    setIsSaving(false);
    setUploadProgress(0);
    setProcessingStatus('');
    setShowMediaModal(false);
    showAlert("Semua proses upload selesai!", "success");
  };

  const handleDeleteFolder = () => {
    if (!selectedFolder) return;
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Folder?',
      message: 'Folder dan isinya akan dihapus permanen.',
      onConfirm: async () => {
        await fetch(`/api/albums?id=${selectedFolder.id}`, { method: 'DELETE' });
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setSelectedFolder(null);
        fetchFolders();
        showAlert("Folder dihapus.", "success");
      }
    });
  };

  const handleDeleteMedia = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Media?',
      message: 'File ini akan dihapus permanen.',
      onConfirm: async () => {
        await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setSelectedFolder(prev => prev ? ({ ...prev, mediaItems: prev.mediaItems.filter(m => m.id !== id) }) : null);
        showAlert("Media dihapus.", "success");
      }
    });
  };

  return (
    <div className="w-full animate-fade-in pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8 border-b border-zinc-800 pb-4 md:pb-6">
        <div>
          {selectedFolder && (
            <button onClick={() => setSelectedFolder(null)} className="group flex items-center gap-2 text-zinc-500 hover:text-white mb-2 text-sm font-bold transition">
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition" /> Kembali
            </button>
          )}
          <h2 className="text-xl md:text-3xl font-bold text-white flex flex-wrap items-center gap-2">
            {selectedFolder ? <><span className="text-zinc-500 font-normal text-base md:text-2xl">Folder /</span> {selectedFolder.title}</> : "Content Management"}
          </h2>
        </div>
        {!selectedFolder && (
          <button onClick={() => setShowFolderModal(true)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg active:scale-95">
            <FolderPlusIcon className="w-5 h-5" /> Buat Folder
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />)}
        </div>
      ) : !selectedFolder ? (
        <FolderList folders={folders} onSelect={setSelectedFolder} />
      ) : (
        <FolderDetail 
          folder={selectedFolder} 
          onDeleteFolder={handleDeleteFolder} 
          onAddMedia={() => setShowMediaModal(true)} 
          onPreviewMedia={setPreviewItem}
          onDeleteMedia={handleDeleteMedia}
        />
      )}

      {/* Modals */}
      <CreateFolderModal 
        isOpen={showFolderModal} 
        categories={categories} 
        isSaving={isSaving} 
        onClose={() => setShowFolderModal(false)} 
        onSubmit={handleCreateFolder} 
        showAlert={(msg) => showAlert(msg)}
      />

      <UploadMediaModal 
        isOpen={showMediaModal} 
        isSaving={isSaving} 
        uploadProgress={uploadProgress} 
        processingStatus={processingStatus}
        // Props baru untuk Multi Upload
        currentFileIndex={currentFileIndex}
        totalFilesToUpload={totalFilesToUpload}
        onClose={() => setShowMediaModal(false)} 
        onSubmit={handleUploadMedia} 
      />

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))} 
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}