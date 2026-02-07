import { XMarkIcon, VideoCameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { MediaItem } from '../types';

interface PreviewModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export default function PreviewModal({ item, onClose }: PreviewModalProps) {
  if (!item) return null;

  return (
    // Background Gelap Penuh (Backdrop)
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Tombol Close (Melayang di Pojok Kanan Atas) */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
        title="Tutup Preview"
      >
        <XMarkIcon className="w-10 h-10" />
      </button>

      {/* Label Info (Melayang di Pojok Kiri Atas) */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
         {item.type === 'VIDEO' ? (
           <VideoCameraIcon className="w-5 h-5 text-blue-400" />
         ) : (
           <PhotoIcon className="w-5 h-5 text-purple-400" />
         )}
         <span className="text-white font-medium text-sm tracking-wide">{item.name}</span>
      </div>

      {/* Area Konten (Full Screen & Responsive) */}
      <div className="relative w-full h-full p-4 md:p-10 flex items-center justify-center">
        {item.type === 'VIDEO' ? (
          <video 
            controls 
            autoPlay 
            className="max-w-full max-h-full w-auto h-auto rounded-lg shadow-2xl outline-none" 
            key={item.id}
          >
            <source src={`/api/media/stream/${item.id}`} type="video/mp4" />
            Browser Anda tidak mendukung pemutar video.
          </video>
        ) : (
          <img 
            src={item.url} 
            alt={item.name} 
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl select-none" 
          />
        )}
      </div>
    </div>
  );
}