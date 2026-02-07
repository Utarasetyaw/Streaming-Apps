'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
}

export default function Pagination({ currentPage, hasMore }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    // Kita salin params yang ada (category atau q) lalu update page-nya saja
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/?${params.toString()}`);
  };

  // Jangan render jika di halaman 1 dan tidak ada halaman berikutnya
  if (currentPage === 1 && !hasMore) return null;

  return (
    <div className="flex justify-center items-center space-x-6 mt-12 mb-8">
      <button
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition ${
          currentPage <= 1 
            ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' 
            : 'border-zinc-700 bg-zinc-900 text-white hover:border-red-600 hover:text-red-500'
        }`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Prev</span>
      </button>

      <div className="text-sm font-mono text-gray-500">
        Page <span className="text-white font-bold text-base mx-1">{currentPage}</span>
      </div>

      <button
        disabled={!hasMore}
        onClick={() => handlePageChange(currentPage + 1)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition ${
          !hasMore 
            ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' 
            : 'border-zinc-700 bg-zinc-900 text-white hover:border-red-600 hover:text-red-500'
        }`}
      >
        <span className="text-sm font-medium">Next</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}