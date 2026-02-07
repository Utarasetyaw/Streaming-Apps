import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { getMovieDetailSecurely } from '@/lib/data'; // Import Fetcher Aman
import { StarIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/solid';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WatchPage({ params }: Props) {
  // 1. Ambil Slug
  const { slug } = await params;
  
  // 2. Fetch Data (Server-Side Secure)
  const movie = await getMovieDetailSecurely(slug);

  // Jika Data Tidak Ada
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-2xl font-bold text-red-500">404</h1>
        <p className="text-gray-500 mt-2">Film tidak ditemukan atau URL salah.</p>
      </div>
    );
  }

  // Tentukan URL awal player
  let initialUrl = movie.playerUrl;
  if (movie.type === 'tv' && movie.seasons?.length > 0) {
     initialUrl = movie.seasons[0].episodes[0]?.playerUrl || movie.playerUrl;
  }

  return (
    <main className="min-h-screen bg-[#060606] text-white font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 animate-fade-in">
        
        {/* 1. SECTION VIDEO PLAYER (Full Width) */}
        <div className="w-full mb-8 lg:mb-12">
           <VideoPlayer 
              initialUrl={initialUrl} 
              seasons={movie.seasons} 
              type={movie.type} 
            />
        </div>

        {/* 2. SECTION INFO & POSTER (Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* KOLOM UTAMA: Detail & Cast */}
          <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
            
            {/* Header: Judul & Meta */}
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

            {/* Genre List */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre.split(',').map((g, i) => (
                <span key={i} className="px-3 py-1.5 bg-zinc-900 text-gray-300 rounded-full text-xs font-medium border border-zinc-800 cursor-default">
                  {g.trim()}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Sinopsis
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base lg:text-lg">
                {movie.description}
              </p>
            </div>

            {/* CAST */}
            <div className="pt-8 border-t border-zinc-900">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-l-4 border-red-600 pl-3">
                  Pemeran Utama
               </h3>
               
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
               
               {movie.cast.length === 0 && (
                 <p className="text-gray-500 text-sm italic">Informasi pemeran tidak tersedia.</p>
               )}
            </div>
          </div>

          {/* KOLOM KANAN: POSTER */}
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