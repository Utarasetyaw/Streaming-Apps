'use client';

import { useState, useEffect } from 'react';
import JWCard from '@/components/JWCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface MovieItem {
  id: string;
  title: string;
  poster: string;
  rating: string;
  year: string;
  genre: string;
  detailPath: string;
}

export default function MovieExplore() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true); // Set loading setiap ganti page
      try {
        // Panggil API Internal kita (yang sudah aman + ada DB Fallback)
        const res = await fetch(`/api/movies?action=trending&page=${page}`);
        const data = await res.json();
        
        if (data.success && Array.isArray(data.items)) {
          setMovies(data.items);
          setHasMore(data.hasMore); // Update status apakah masih ada halaman selanjutnya
        } else {
          setMovies([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Gagal memuat katalog:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
    
    // Scroll ke atas sedikit saat ganti halaman (opsional, agar UX enak)
    if (page > 1) {
        const element = document.getElementById('catalog-header');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }

  }, [page]); // Re-run effect setiap 'page' berubah

  const handleNext = () => {
    if (hasMore) setPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  return (
    <div className="animate-fade-in">
      <div id="catalog-header" className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white">Katalog Film</h2>
           <p className="text-zinc-500 text-sm">Jelajahi koleksi film premium terpopuler.</p>
        </div>
        <div className="text-zinc-500 text-sm font-mono bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
           Halaman <span className="text-white font-bold">{page}</span>
        </div>
      </div>

      {isLoading ? (
        // Skeleton Loading
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
               <div className="aspect-[2/3] bg-zinc-900 rounded-md border border-zinc-800" />
               <div className="h-4 bg-zinc-900 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        // Grid Film
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie, index) => {
             const cleanLabel = movie.genre ? movie.genre.split(',')[0] : movie.year;

             return (
              <JWCard 
                key={`${movie.id}-${index}`}
                title={movie.title} 
                image={movie.poster} 
                label={cleanLabel} 
                rating={movie.rating}
                detailPath={movie.detailPath} 
              />
             );
          })}
          
          {movies.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
              <p>Belum ada film yang tersedia saat ini.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-zinc-900">
        <button
          onClick={handlePrev}
          disabled={page === 1 || isLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition duration-200 ${
             page === 1 || isLoading
             ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
             : 'bg-zinc-800 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/20'
          }`}
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Prev
        </button>

        <button
          onClick={handleNext}
          disabled={!hasMore || isLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition duration-200 ${
             !hasMore || isLoading
             ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
             : 'bg-zinc-800 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/20'
          }`}
        >
          Next
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}