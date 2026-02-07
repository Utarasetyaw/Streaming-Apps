'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// Daftar kategori sesuai API action yang Anda berikan
const categories = [
  { label: 'Trending', value: 'trending' },
  { label: 'Indo Movie', value: 'indonesian-movies' },
  { label: 'Indo Drama', value: 'indonesian-drama' },
  { label: 'K-Drama', value: 'kdrama' },
  { label: 'Anime', value: 'anime' },
  { label: 'Western TV', value: 'western-tv' },
  { label: 'Short TV', value: 'short-tv' },
  { label: 'Adult Comedy', value: 'adult-comedy' },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil state dari URL
  const activeCategory = searchParams.get('category') || 'trending';
  const activeSearch = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(activeSearch);

  // Update input jika URL berubah (misal user back button)
  useEffect(() => {
    setSearchTerm(activeSearch);
  }, [activeSearch]);

  // Fungsi Ganti Kategori
  const handleCategoryClick = (catValue: string) => {
    // Reset page ke 1, hapus query search
    router.push(`/?category=${catValue}&page=1`);
    setSearchTerm(''); // Kosongkan search bar visual
  };

  // Fungsi Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // Pindah ke mode search, reset page ke 1
    router.push(`/?q=${encodeURIComponent(searchTerm)}&page=1`);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto md:mx-0">
        <input 
          type="text"
          placeholder="Cari film (misal: Agak Laen)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition text-sm"
        />
        <button 
          type="submit" 
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-red-600 rounded-full hover:bg-red-700 transition shadow-lg"
        >
          <MagnifyingGlassIcon className="w-4 h-4 text-white" />
        </button>
      </form>

      {/* Kategori Horizontal Scroll */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide select-none">
        {categories.map((cat) => {
          const isActive = !activeSearch && activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition duration-200 border 
                ${isActive 
                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-900/20' 
                  : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}