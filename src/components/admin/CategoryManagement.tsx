'use client';

import { useState, useEffect } from 'react';
import { 
  TagIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  _count?: {
    albums: number;
  };
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [inputVal, setInputVal] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    setIsSaving(true);
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, name: inputVal })
        });
        if (!res.ok) throw new Error('Gagal update kategori');
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: inputVal })
        });
        if (!res.ok) throw new Error('Gagal tambah kategori');
      }
      
      setInputVal('');
      setEditingId(null);
      await fetchCategories();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setInputVal(cat.name);
    // Scroll ke atas agar user sadar form berubah
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (cat: Category) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/categories?id=${categoryToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        const json = await res.json();
        alert(json.error || 'Gagal menghapus');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus');
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInputVal('');
  };

  return (
    <div className="w-full animate-fade-in pb-20 lg:pb-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <TagIcon className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            Manajemen Kategori
          </h2>
          <p className="text-zinc-500 text-sm mt-1 ml-1">Kelola genre film (Action, Horror, Drama, dll)</p>
        </div>
      </div>
      
      {/* FORM INPUT STICKY (RESPONSIVE) */}
      <div className="sticky top-4 z-10 bg-zinc-900/90 backdrop-blur-xl p-5 rounded-2xl border border-zinc-800 shadow-2xl mb-8 transition-all">
        <form onSubmit={handleSave}>
           <label className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center justify-between">
              <span>{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</span>
              {editingId && <span className="text-red-500 animate-pulse">Sedang Mengedit...</span>}
           </label>
           
           <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-4 py-3 bg-black border border-zinc-700 rounded-xl outline-none text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition font-bold placeholder-zinc-700"
                placeholder="Masukkan nama kategori (Contoh: Documentary)"
                required
              />
              
              <div className="flex gap-2 h-12">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit} 
                    className="h-full px-5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-zinc-400 transition"
                  >
                    Batal
                  </button>
                )}
                
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-full px-6 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg shadow-red-900/20 flex items-center gap-2 transition disabled:opacity-70"
                >
                  {isSaving ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {editingId ? <PencilSquareIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                      <span>{editingId ? 'Update' : 'Tambah'}</span>
                    </>
                  )}
                </button>
              </div>
           </div>
        </form>
      </div>

      {isLoading ? (
        // SKELETON LOADING
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      ) : (
        // LIST KATEGORI (GRID RESPONSIVE)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-600 transition group flex flex-col justify-between shadow-sm hover:shadow-lg h-full">
              
              <div className="mb-4">
                <span className="font-bold text-white text-lg block mb-1 group-hover:text-red-500 transition">{cat.name}</span>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-md text-xs font-medium text-zinc-400">
                   <TagIcon className="w-3 h-3" />
                   {cat._count?.albums || 0} Film
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-800/50 mt-auto">
                <button 
                  onClick={() => handleEdit(cat)} 
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-sm font-bold transition"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => confirmDelete(cat)} 
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold transition"
                >
                  <TrashIcon className="w-4 h-4" /> Hapus
                </button>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
             <div className="col-span-full py-16 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Belum ada kategori yang dibuat.</p>
             </div>
          )}
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS (CENTERED) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
          
          {/* Modal Content */}
          <div className="relative bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Hapus Kategori?</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Anda akan menghapus <strong className="text-white">"{categoryToDelete?.name}"</strong>.<br/>
                Kategori ini akan hilang dari semua film yang menggunakannya.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-lg shadow-red-900/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}