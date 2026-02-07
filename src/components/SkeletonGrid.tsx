export default function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {/* Membuat 12 item dummy yang berkedip (animate-pulse) */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-2 animate-pulse">
          {/* Kotak Poster */}
          <div className="aspect-[2/3] bg-zinc-800/50 rounded-md w-full relative overflow-hidden border border-zinc-800">
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-zinc-700/10 to-transparent" />
          </div>
          {/* Garis Judul */}
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          {/* Garis Rating */}
          <div className="h-3 bg-zinc-800 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}