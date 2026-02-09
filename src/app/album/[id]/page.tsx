'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlayCircleIcon, 
  VideoCameraIcon, 
  PhotoIcon,
  XMarkIcon,
  ShieldCheckIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

interface MediaItem {
  id: number;
  name: string;
  type: 'VIDEO' | 'PHOTO';
  url: string;
}

interface AlbumDetail {
  id: number;
  title: string;
  thumbnailUrl: string;
  categories: { name: string }[];
  mediaItems: MediaItem[];
}

export default function AlbumPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [username, setUsername] = useState('Member');

  // --- DATA LOADING ---
  useEffect(() => {
    const authStatus = localStorage.getItem('is_logged_in');
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUsername(storedUser);

    if (authStatus !== 'true') {
      router.replace('/login');
      return;
    }

    if (id) fetchAlbumDetail();
  }, [id, router]);

  const fetchAlbumDetail = async () => {
    try {
      const res = await fetch('/api/albums'); 
      const allAlbums: AlbumDetail[] = await res.json();
      const found = allAlbums.find(a => a.id === Number(id));
      if (found) setAlbum(found);
      else router.push('/dashboard'); 
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // --- SECURITY: DISABLE SHORTCUTS ---
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p'))
      ) {
        e.preventDefault();
        alert("Protected Content.");
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- SECURITY: BLOB URL (PHOTO) ---
  const [secureImageUrl, setSecureImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let activeObjectUrl: string | null = null;
    if (playingMedia?.type === 'PHOTO') {
      fetch(`/api/media/stream/${playingMedia.id}`)
        .then(res => res.blob())
        .then(blob => {
          const objectUrl = URL.createObjectURL(blob);
          activeObjectUrl = objectUrl;
          setSecureImageUrl(objectUrl);
        });
    }
    return () => {
      if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
      setSecureImageUrl(null);
    };
  }, [playingMedia]);


  if (isLoading && !album) return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!album) return null;

  return (
    <div className="min-h-screen bg-[#060606] text-white font-sans select-none" onContextMenu={(e) => e.preventDefault()}>
      
      {/* NAVBAR (SOLID BACKGROUND) */}
      <header className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-white">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg truncate text-zinc-300">
            Kembali ke Dashboard
          </h1>
        </div>
      </header>

      {/* COMPACT INFO SECTION */}
      <div className="pt-24 pb-8 px-4 md:px-8 border-b border-zinc-800 bg-zinc-900/20">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-end gap-6">
           
           {/* Thumbnail Kecil */}
           <div className="w-32 h-44 md:w-40 md:h-56 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-800">
              <img src={album.thumbnailUrl} className="w-full h-full object-cover" alt="Cover" />
           </div>

           {/* Info Text */}
           <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {album.categories && album.categories.map((c, i) => (
                    <span key={i} className="bg-red-600/10 text-red-500 border border-red-600/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {c.name}
                    </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">{album.title}</h1>
              
              <div className="flex items-center gap-4 text-zinc-400 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <FolderIcon className="w-4 h-4" /> 
                  {album.mediaItems.length} File
                </span>
                <span className="flex items-center gap-1.5 text-green-500">
                  <ShieldCheckIcon className="w-4 h-4" /> 
                  Secure
                </span>
              </div>
           </div>
        </div>
      </div>

      {/* LIST MEDIA */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.mediaItems.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => setPlayingMedia(item)}
              className="group cursor-pointer bg-zinc-900 border border-zinc-800 p-3 rounded-xl hover:border-red-600/50 transition duration-300 shadow-sm hover:shadow-lg flex items-center gap-4"
            >
              {/* Icon / Thumbnail Kecil */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'VIDEO' ? 'bg-red-900/20 text-red-500' : 'bg-purple-900/20 text-purple-500'}`}>
                {item.type === 'VIDEO' ? <PlayCircleIcon className="w-7 h-7" /> : <PhotoIcon className="w-6 h-6" />}
              </div>

              {/* Text Info */}
              <div className="overflow-hidden">
                <p className="text-[9px] font-bold text-zinc-500 mb-0.5 uppercase tracking-wider">
                  {item.type === 'VIDEO' ? `Eps ${index + 1}` : 'IMG'}
                </p>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition">{item.name}</h4>
              </div>
            </div>
          ))}
        </div>
        
        {album.mediaItems.length === 0 && (
          <div className="text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <p>Folder ini kosong.</p>
          </div>
        )}
      </div>

      {/* --- FULLSCREEN PLAYER --- */}
      {playingMedia && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-300">
          
          {/* FLOATING HEADER */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[60] bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
             <div className="pointer-events-auto">
               <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg max-w-[70vw] truncate">{playingMedia.name}</h2>
               <div className="flex items-center gap-2 mt-1 opacity-70">
                 <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                 <span className="text-xs text-zinc-300 font-mono tracking-wider">fineshythouse.online</span>
               </div>
             </div>
             
             <button 
               onClick={() => { setPlayingMedia(null); setSecureImageUrl(null); }}
               className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 hover:text-red-500 rounded-full text-white transition backdrop-blur-md border border-white/5"
             >
               <XMarkIcon className="w-8 h-8" />
             </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            
            {/* 🔒 WATERMARK RESPONSIVE 
              - fineshythouse.online
              - Responsive Grid & Font Size
            */}
            <div className="absolute inset-0 z-[55] pointer-events-none overflow-hidden select-none grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 content-between justify-items-center gap-y-12 gap-x-4 p-8 opacity-20">
               {/* Generate 20 items agar layar penuh */}
               {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-center transform -rotate-12">
                     {/* DOMAIN UTAMA (Besar) */}
                     <span className="text-white text-xs sm:text-base md:text-xl lg:text-2xl font-black uppercase whitespace-nowrap drop-shadow-md">
                        fineshythouse.online
                     </span>
                     {/* USERNAME (Kecil di bawahnya) */}
                     <span className="text-zinc-400 text-[10px] sm:text-xs md:text-sm font-mono mt-1">
                        User: {username}
                     </span>
                  </div>
               ))}
            </div>

            {/* 🔒 TRANSPARENT SHIELD (Prevent Right Click on Video) */}
            <div className="absolute inset-0 z-[50]" onContextMenu={(e) => e.preventDefault()}></div>

            {playingMedia.type === 'VIDEO' ? (
              <div className="w-full h-full flex items-center justify-center relative z-40 bg-black">
                <video 
                  controls 
                  autoPlay 
                  className="w-full h-full max-h-screen object-contain" 
                  src={`/api/media/stream/${playingMedia.id}`}
                  controlsList="nodownload noplaybackrate" 
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                >
                  Browser Anda tidak mendukung.
                </video>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center relative z-40 p-4">
                {secureImageUrl ? (
                  <img 
                    src={secureImageUrl} 
                    alt="Protected" 
                    className="max-h-screen max-w-full object-contain pointer-events-none drop-shadow-2xl" 
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <div className="text-zinc-500 animate-pulse text-lg font-bold">Membuka Gambar Aman...</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}