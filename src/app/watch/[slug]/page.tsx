import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { getMovieDetailSecurely } from '@/lib/data'; 
import { StarIcon, CalendarIcon, UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;
  
  const movie = await getMovieDetailSecurely(slug);

  if (!movie) {
    return (
      <main className="min-h-screen bg-[#060606] text-white font-sans selection:bg-red-600 selection:text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 max-w-lg w-full">
            <ExclamationCircleIcon className="w-20 h-20 text-red-600 mx-auto mb-6 opacity-80" />
            <h1 className="text-3xl font-bold mb-3">Konten Tidak Ditemukan</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Video yang Anda cari mungkin telah dihapus, URL salah, atau server kami sedang mengalami gangguan berat dan belum memiliki salinan data ini.
            </p>
            <a href="/" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition transform hover:scale-105">
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </main>
    );
  }

  let initialUrl = movie.playerUrl;
  if (movie.type === 'tv' && movie.seasons && movie.seasons.length > 0) {
     const firstSeason = movie.seasons[0];
     if (firstSeason && firstSeason.episodes && firstSeason.episodes.length > 0) {
        initialUrl = firstSeason.episodes[0].playerUrl;
     }
  }

  return (
    <main className="min-h-screen bg-[#060606] text-white font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 animate-fade-in">
        
        <div className="w-full mb-8 lg:mb-12">
           <VideoPlayer 
              initialUrl={initialUrl} 
              seasons={movie.seasons} 
              type={movie.type} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
            
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-5 text-xs md:text-sm font-medium text-gray-400">
                 <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                    <StarIcon className="w-4 h-4" /> {movie.rating}
                 </span>
                 <span className="flex items-center gap-1.5 bg-zinc-800 px-2 py-1 rounded">
                    <CalendarIcon className="w-4 h-4 text-zinc-400" /> {movie.year}
                 </span>
                 <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded uppercase tracking-wider text-[10px] md:text-xs text-white">
                    {movie.type}
                 </span>
                 <span className="text-gray-500 border-l border-zinc-800 pl-3">
                    {movie.country}
                 </span>
              </div>
            </div>

            {movie.genre && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.split(',').map((g: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-zinc-900 text-gray-300 rounded-full text-xs font-medium border border-zinc-800 cursor-default">
                    {g.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Sinopsis
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base lg:text-lg">
                {movie.description || "Tidak ada deskripsi tersedia."}
              </p>
            </div>

            <div className="pt-8 border-t border-zinc-900">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-l-4 border-red-600 pl-3">
                  Pemeran Utama
               </h3>
               
               {movie.cast && movie.cast.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                   {movie.cast.map((c, i) => (
                     <div key={i} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 shadow-lg">
                           {c.avatar ? (
                             <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-zinc-600">
                               <UserIcon className="w-6 h-6" />
                             </div>
                           )}
                        </div>
                        <div className="overflow-hidden">
                           <p className="text-sm font-bold text-white truncate group-hover:text-red-500 transition">{c.name}</p>
                           <p className="text-xs text-gray-500 truncate">{c.character}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-gray-500 text-sm italic">Informasi pemeran tidak tersedia.</p>
               )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 order-1 lg:order-2">
             <div className="sticky top-28">
               <div className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900 relative aspect-[2/3]">
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-full h-full object-cover" 
                  />
               </div>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}