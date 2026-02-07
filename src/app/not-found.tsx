import Link from 'next/link';
import Navbar from '@/components/Navbar'; // Kita reuse Navbar agar user tetap bisa navigasi

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#060606] text-white font-sans relative overflow-hidden flex flex-col">
      {/* Navbar tetap dimunculkan agar user tidak bingung */}
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 text-center">
         
         {/* Efek Background Glow (Merah Redup) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

         {/* Angka 404 Besar */}
         <h1 className="text-[120px] sm:text-[180px] md:text-[250px] font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 via-zinc-900 to-transparent leading-none select-none drop-shadow-2xl">
           404
         </h1>

         {/* Pesan Error di atas angka 404 (Layering effect) */}
         <div className="relative -mt-10 md:-mt-20 space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
              Halaman Hilang di Luar Angkasa
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
              Maaf, halaman yang Anda tuju tidak ditemukan. Mungkin URL salah atau konten telah dihapus oleh admin.
            </p>

            {/* Tombol Kembali */}
            <div className="pt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition duration-300 transform hover:scale-105 shadow-lg shadow-red-900/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Home
              </Link>
            </div>
         </div>

      </div>

      {/* Footer copyright kecil */}
      <div className="absolute bottom-6 w-full text-center text-zinc-800 text-xs font-mono uppercase tracking-widest">
        Fineshyt Streaming Member
      </div>
    </main>
  );
}