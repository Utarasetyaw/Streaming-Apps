import JWCard from '@/components/JWCard';
import Pagination from '@/components/Pagination';
import { getMoviesSecurely } from '@/lib/data'; // Import dari file yang kita buat di langkah 1

interface MovieGridProps {
  category: string;
  page: number;
  query?: string;
}

export default async function MovieGrid({ category, page, query }: MovieGridProps) {
  // Panggil API di server (Aman & Tersembunyi)
  const data = await getMoviesSecurely(category, page, query);

  // Jika data kosong
  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
        <p className="text-lg md:text-xl font-medium text-zinc-400">Data tidak ditemukan</p>
        <p className="text-xs md:text-sm mt-2">Coba refresh atau pilih kategori lain.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Grid Film */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {data.items.map((movie, index) => {
          const cleanLabel = movie.genre 
            ? movie.genre.split(',')[0] 
            : movie.year;

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
      </div>

      {/* Pagination */}
      <div className="mt-12 md:mt-16 pt-8 border-t border-zinc-900 flex justify-center">
          <Pagination currentPage={page} hasMore={data.hasMore} />
      </div>
    </div>
  );
}