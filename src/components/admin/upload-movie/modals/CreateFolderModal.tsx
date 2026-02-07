import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChevronDownIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Category } from '../types';

interface CreateFolderModalProps {
  isOpen: boolean;
  categories: Category[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (title: string, categoryIds: string[], file: File) => void;
  showAlert: (msg: string) => void;
}

export default function CreateFolderModal({ isOpen, categories, isSaving, onClose, onSubmit, showAlert }: CreateFolderModalProps) {
  const [title, setTitle] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // STATE INI BERNAMA 'isDropdownOpen'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setCategoryIds([]);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailFile) return showAlert("Pilih thumbnail poster dulu!");
    if (categoryIds.length === 0) return showAlert("Pilih minimal satu kategori!");
    onSubmit(title, categoryIds, thumbnailFile);
  };

  const toggleCategory = (id: string) => {
    setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
          <h3 className="text-xl font-bold text-white">Buat Folder Baru</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Judul Folder</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition placeholder-zinc-700" 
                placeholder="Contoh: Avengers Collection" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>

            {/* Multi-Select Categories */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Kategori</label>
              
              <div 
                // PERBAIKAN: Menggunakan 'isDropdownOpen' bukan 'isCategoryDropdownOpen'
                className={`w-full min-h-[50px] px-4 py-3 bg-black border rounded-xl cursor-pointer flex justify-between items-center transition-all ${isDropdownOpen ? 'border-red-600 ring-1 ring-red-600' : 'border-zinc-800 hover:border-zinc-600'}`} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex flex-wrap gap-2">
                  {categoryIds.length > 0 ? categoryIds.map(id => (
                    <span key={id} className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded shadow-sm animate-in zoom-in-50">
                      {categories.find(c => c.id.toString() === id)?.name}
                    </span>
                  )) : <span className="text-zinc-600 text-sm">Pilih kategori...</span>}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-inner overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-2">
                    {categories.map(cat => {
                      const isSelected = categoryIds.includes(cat.id.toString());
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => toggleCategory(cat.id.toString())} 
                          className={`flex justify-between items-center p-3 rounded-lg cursor-pointer mb-1 transition-colors ${isSelected ? 'bg-red-600/10 border border-red-600/20' : 'hover:bg-zinc-800 border border-transparent'}`}
                        >
                          <span className={`text-sm font-bold ${isSelected ? 'text-red-500' : 'text-zinc-300'}`}>{cat.name}</span>
                          {isSelected && <CheckCircleIcon className="w-5 h-5 text-red-500" />}
                        </div>
                      );
                    })}
                    {categories.length === 0 && <p className="text-center text-zinc-500 text-sm py-2">Tidak ada kategori.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase text-center tracking-wider">Poster Thumbnail</label>
              <div 
                className="relative h-48 bg-black border-2 border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all group" 
                onClick={() => document.getElementById('thumbInput')?.click()}
              >
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} className="w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                      <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Ganti Gambar</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center group-hover:scale-105 transition duration-300">
                    <PhotoIcon className="w-12 h-12 text-zinc-700 mx-auto mb-2 group-hover:text-zinc-500" />
                    <p className="text-zinc-600 text-xs font-bold mt-2 uppercase group-hover:text-zinc-400">Klik untuk upload</p>
                  </div>
                )}
                <input 
                  id="thumbInput" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => { 
                    if(e.target.files?.[0]) { 
                      setThumbnailFile(e.target.files[0]); 
                      setThumbnailPreview(URL.createObjectURL(e.target.files[0])); 
                    }
                  }} 
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 pb-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition active:scale-95" 
                disabled={isSaving}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menyimpan...
                  </span>
                ) : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}