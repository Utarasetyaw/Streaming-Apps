'use client';

import { useState, useEffect } from 'react';
import JWCard from '@/components/JWCard';

// Sesuaikan interface dengan struktur API baru
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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Kita ambil data "Trending" sebagai default isi Katalog
        const res = await fetch('https://zeldvorik.ru/apiv3/api.php?action=trending&page=1');
        const data = await res.json();
        
        if (data.success && Array.isArray(data.items)) {
          setMovies(data.items);
        }
      } catch (error) {
        console.error("Gagal memuat katalog:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Katalog Film</h2>
        <p className="text-zinc-500 text-sm">Pilih koleksi film premium yang ingin Anda tonton.</p>
      </div>

      {isLoading ? (
        // Skeleton Loading
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-zinc-900 animate-pulse rounded-md border border-zinc-800" />
          ))}
        </div>
      ) : (
        // Grid Film
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => {
             // Ambil genre pertama saja agar rapi
             const cleanLabel = movie.genre ? movie.genre.split(',')[0] : movie.year;

             return (
              <JWCard 
                key={movie.id}
                title={movie.title} 
                image={movie.poster} 
                label={cleanLabel} 
                rating={movie.rating}
                detailPath={movie.detailPath} // Oper detailPath agar bisa diklik
              />
             );
          })}
          
          {movies.length === 0 && (
            <div className="col-span-full py-20 text-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
              Belum ada film yang tersedia saat ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
}