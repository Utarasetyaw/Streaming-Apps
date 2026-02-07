import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid'; // Opsional: jika ingin pakai icon

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black via-black/80 to-transparent transition-all duration-300 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 md:p-6 flex justify-between items-center">
        
        {/* BAGIAN KIRI: Logo & Menu Navigasi */}
        <div className="flex items-center gap-6 md:gap-10">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-lg md:text-2xl font-bold text-white tracking-tighter uppercase cursor-pointer drop-shadow-md hover:text-red-600 transition-colors"
          >
            Fineshyt
          </Link>

          {/* Menu Items (Home) */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-white hover:text-red-500 transition-colors"
            >
              <HomeIcon className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </Link>
            
            {/* Anda bisa menambahkan menu lain di sini nanti, misal: Katalog, My List */}
          </div>
        </div>

        {/* BAGIAN KANAN: Tombol Aksi */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            href="/login" 
            className="px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-bold text-white bg-red-600 rounded-full hover:bg-red-700 transition transform hover:scale-105 shadow-lg shadow-red-900/20"
          >
            Masuk
          </Link>
          <Link 
            href="https://t.me/Jocc16" 
            target="_blank"
            className="flex items-center gap-1.5 md:gap-2 px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition shadow-[0_0_15px_rgba(255,255,255,0.3)] transform hover:scale-105"
          >
            <svg className="w-3 h-3 md:w-4 md:h-4 text-[#229ED9]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}