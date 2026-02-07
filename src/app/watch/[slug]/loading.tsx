import Navbar from '@/components/Navbar';

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#060606] text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16 animate-pulse">
        
        {/* Skeleton Video Player */}
        <div className="w-full mb-8 lg:mb-12">
           <div className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 w-full relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-zinc-800/30 to-transparent" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Kolom Kiri (Info) */}
          <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1 space-y-6">
            
            {/* Judul */}
            <div className="h-8 md:h-12 bg-zinc-800 rounded-lg w-3/4" />
            
            {/* Meta Tags */}
            <div className="flex gap-3">
              <div className="h-6 w-16 bg-zinc-800 rounded" />
              <div className="h-6 w-16 bg-zinc-800 rounded" />
              <div className="h-6 w-16 bg-zinc-800 rounded" />
            </div>

            {/* Genre */}
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-zinc-900 border border-zinc-800 rounded-full" />
              <div className="h-6 w-24 bg-zinc-900 border border-zinc-800 rounded-full" />
              <div className="h-6 w-16 bg-zinc-900 border border-zinc-800 rounded-full" />
            </div>

            {/* Sinopsis */}
            <div className="space-y-2 pt-4">
               <div className="h-4 bg-zinc-800 rounded w-full" />
               <div className="h-4 bg-zinc-800 rounded w-full" />
               <div className="h-4 bg-zinc-800 rounded w-5/6" />
            </div>

            {/* Cast Grid Skeleton */}
            <div className="pt-8 border-t border-zinc-900">
               <div className="h-6 w-32 bg-zinc-800 rounded mb-6" />
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                      <div className="w-10 h-10 rounded-full bg-zinc-800" />
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-zinc-800 rounded w-3/4" />
                        <div className="h-2 bg-zinc-800 rounded w-1/2" />
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Kolom Kanan (Poster) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 order-1 lg:order-2">
             <div className="aspect-[2/3] bg-zinc-900 rounded-2xl border border-zinc-800" />
          </div>

        </div>
      </div>
    </main>
  );
}