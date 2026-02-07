import Link from 'next/link';
import { PlayIcon, BookmarkIcon } from '@heroicons/react/24/solid';

interface CardProps {
  title: string;
  image: string;
  label?: string; 
  rating?: string;
  detailPath: string; // Tambahkan prop ini
}

export default function JWCard({ title, image, label, rating, detailPath }: CardProps) {
  return (
    <Link href={`/watch/${detailPath}`} className="group relative cursor-pointer block">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 shadow-md">
        {/* Gambar */}
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-50" 
          loading="lazy"
        />
        
        {/* Label Pojok Kanan (Genre) */}
        {label && (
          <div className="absolute top-0 right-0">
             <div className="bg-white/90 backdrop-blur-sm text-black text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-bl-lg shadow-sm">
                {label}
             </div>
          </div>
        )}

        {/* Tombol Bookmark Kiri */}
        <div className="absolute top-0 left-2">
           <div className="w-5 h-7 md:w-6 md:h-8 bg-black/60 backdrop-blur-md flex items-center justify-center rounded-b-sm">
              <BookmarkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 hover:text-yellow-500 transition" />
           </div>
        </div>

        {/* Icon Play Tengah (Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition">
                <PlayIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
        </div>
        
        {/* Rating Pojok Bawah */}
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] text-gray-300 font-mono">
            {rating || "HD"}
        </div>
      </div>
      
      {/* Judul */}
      <h3 className="mt-2 text-xs md:text-sm text-gray-300 font-medium truncate group-hover:text-white transition">
        {title}
      </h3>
    </Link>
  );
}