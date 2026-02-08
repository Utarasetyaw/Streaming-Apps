import JWCard from '@/components/JWCard';
import Pagination from '@/components/Pagination';
import { getMoviesSecurely } from '@/lib/data';
import { ExclamationTriangleIcon, SignalSlashIcon } from '@heroicons/react/24/solid';

interface MovieGridProps {
  category: string;
  page: number;
  query?: string;
}

export default async function MovieGrid({ category, page, query }: MovieGridProps) {
  const data = await getMoviesSecurely(category, page, query);

  // 1. CEK ERROR DULU (Jika API Mati/Maintenance)
  if (data.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-in border border-dashed border-red-900/50 rounded-xl bg-red-900/10 py-10">
         <SignalSlashIcon className="w-16 h-16 text-red-500 mb-4" />
         <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Layanan Sedang Gangguan</h2>
         <p className="text-zinc-400 text-sm md:text-base max-w-md mb-6">
            Maaf, kami sedang mengalami kendala koneksi ke server pusat. Mohon coba muat ulang halaman beberapa saat lagi.
         </p>
         <a 
           href={`/?category=${category}&page=${page}`}
           className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm flex items-center gap-2"
         >
           Coba Muat Ulang
         </a>
      </div>
    );
  }

  // 2. CEK DATA KOSONG (Jika API Hidup tapi tidak ada hasil)
  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
        <ExclamationTriangleIcon className="w-12 h-12 mb-4 text-zinc-600" />
        <p className="text-lg md:text-xl font-medium text-zinc-400">Data tidak ditemukan</p>
        <p className="text-xs md:text-sm mt-2">Coba kata kunci lain atau pilih kategori berbeda.</p>
      </div>
    );
  }

  // 3. TAMPILAN NORMAL
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