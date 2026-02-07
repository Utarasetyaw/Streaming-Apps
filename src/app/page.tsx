import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import MovieGrid from '@/components/MovieGrid';
import SkeletonGrid from '@/components/SkeletonGrid';

// Memaksa halaman selalu dinamis (tidak di-cache statis)
export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  // Await params untuk Next.js 15+
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const category = (params.category as string) || 'trending';
  const searchQuery = (params.q as string) || undefined;

  const getPageTitle = () => {
    if (searchQuery) return `Hasil Pencarian: "${searchQuery}"`;
    return category.replace(/-/g, ' ').toUpperCase();
  };

  // Membuat Key unik untuk Suspense. 
  // Setiap key berubah (ganti page/kategori), Suspense akan me-reset dan menampilkan SkeletonGrid.
  const suspenseKey = searchQuery 
    ? `search-${searchQuery}-${page}` 
    : `cat-${category}-${page}`;

  return (
    <main className="min-h-screen bg-[#060606] text-white font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
        
        {/* Header Section (Selalu Muncul) */}
        <div className="mb-8 md:mb-10 border-b border-zinc-800 pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
            Streaming <span className="text-red-600">Member</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-400 text-xs sm:text-sm">
             <p>
                Kategori: <span className="text-white font-semibold ml-1">{getPageTitle()}</span>
             </p>
             <p className="hidden sm:block">
                Halaman <span className="text-white font-bold">{page}</span>
             </p>
          </div>
        </div>

        {/* Filter Bar (Selalu Muncul) */}
        <div className="mb-8">
           <FilterBar />
        </div>
        
        {/* AREA KONTEN UTAMA DENGAN EFEK LOADING */}
        <div className="min-h-[50vh]">
          <Suspense key={suspenseKey} fallback={<SkeletonGrid />}>
            <MovieGrid category={category} page={page} query={searchQuery} />
          </Suspense>
        </div>

      </div>
    </main>
  );
}