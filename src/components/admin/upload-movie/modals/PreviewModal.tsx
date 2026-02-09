import { XMarkIcon, VideoCameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { MediaItem } from '../types';

interface PreviewModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export default function PreviewModal({ item, onClose }: PreviewModalProps) {
  if (!item) return null;

  const streamUrl = `/api/media/stream/${item.id}`;

  return (
    // 1. Gunakan z-[100] dan h-[100dvh] (dynamic viewport height) untuk mobile browser
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 h-[100dvh] w-screen">
      
      {/* 2. AREA KLIK BACKDROP (Agar user bisa klik di mana saja untuk close) */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* 3. TOMBOL CLOSE (Diperbaiki) */}
      <button 
        onClick={onClose} 
        // Tambahkan 'bg-black/50', 'backdrop-blur', dan z-index tinggi (z-50)
        // Tambahkan 'safe-area-top' logic manual dengan top-4 md:top-6
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2.5 bg-black/60 hover:bg-zinc-800 text-white rounded-full transition-all duration-200 backdrop-blur-md border border-white/10 shadow-lg group"
        title="Tutup Preview"
      >
        <XMarkIcon className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Label Info */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-40 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg pointer-events-none">
         {item.type === 'VIDEO' ? (
           <VideoCameraIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
         ) : (
           <PhotoIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
         )}
         <span className="text-white font-medium text-xs md:text-sm tracking-wide max-w-[200px] truncate">
            {item.name}
         </span>
      </div>

      {/* Area Konten */}
      <div className="relative z-10 w-full h-full p-2 md:p-10 flex items-center justify-center pointer-events-none">
        {/* pointer-events-auto ditambahkan pada elemen video/img agar kontrol video tetap bisa diklik */}
        
        {item.type === 'VIDEO' ? (
          <video 
            controls 
            autoPlay 
            // PENTING: playsInline wajib ada agar di iPhone tidak otomatis fullscreen native (yang menutupi tombol close)
            playsInline 
            className="pointer-events-auto max-w-full max-h-[80vh] md:max-h-full w-auto h-auto rounded-lg shadow-2xl outline-none border border-zinc-800 bg-black" 
            key={item.id}
          >
            <source src={streamUrl} type="video/mp4" />
            Browser Anda tidak mendukung pemutar video.
          </video>
        ) : (
          <img 
            src={streamUrl} 
            alt={item.name} 
            className="pointer-events-auto max-w-full max-h-[85vh] md:max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl select-none" 
          />
        )}
      </div>
    </div>
  );
}