'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FolderIcon, 
  MagnifyingGlassIcon, 
  GlobeAltIcon, 
  ClockIcon, 
  PlayCircleIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

interface Album {
  id: number;
  title: string;
  thumbnailUrl: string;
  categories: { name: string }[];
  mediaItems: any[];
}

interface ExternalVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  file_size: string;
  upload_date: string;
  url: string;
}

export default function UserDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'LOCAL' | 'EXTERNAL'>('LOCAL');
  const [isLoading, setIsLoading] = useState(true);
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [externalVideos, setExternalVideos] = useState<ExternalVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('is_logged_in');
    if (authStatus !== 'true') {
      router.replace('/login');
      return;
    }

    const fetchLocalData = async () => {
      try {
        const res = await fetch('/api/albums');
        const data: Album[] = await res.json();
        setAlbums(data);
        const allCats = data.flatMap(album => album.categories.map(c => c.name));
        const uniqueCats = Array.from(new Set(allCats));
        setCategories(['All', ...uniqueCats]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocalData();

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, [router]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsError(false);
    setExternalVideos([]);

    try {
      const res = await fetch(`/api/proxy-videq?q=${encodeURIComponent(searchQuery)}&page=${searchPage}`);
      const result = await res.json();

      if (!res.ok || result.isError) {
         setIsError(true);
      } else if (result.success && Array.isArray(result.data)) {
        setExternalVideos(result.data);
      } else {
        setExternalVideos([]);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const filteredCollections = selectedCategory === 'All' 
    ? albums 
    : albums.filter(item => item.categories.some(c => c.name === selectedCategory));


  if (isLoading) return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060606] text-white font-sans selection:bg-red-600 selection:text-white">
      
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold text-red-600 tracking-tighter uppercase cursor-default">
            Streaming<span className="text-white">Member</span>
          </div>

          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all duration-300 shadow-lg shadow-red-900/20 active:scale-95"
          >
            <span>Log Out</span>
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-white/80 group-hover:text-white" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 pt-32 pb-20">
        
        <div className="flex justify-center mb-10">
          <div className="bg-zinc-900 p-1 rounded-full border border-zinc-800 inline-flex shadow-xl">
            <button 
              onClick={() => setActiveTab('LOCAL')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'LOCAL' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white'}`}
            >
              Koleksi Eksklusif
            </button>
            <button 
              onClick={() => setActiveTab('EXTERNAL')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'EXTERNAL' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-zinc-500 hover:text-white'}`}
            >
              <GlobeAltIcon className="w-4 h-4" />
              Nonton di Videq
            </button>
          </div>
        </div>

        {activeTab === 'LOCAL' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-zinc-800 pb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Folder Koleksi</h1>
                <p className="text-zinc-500 text-sm">Konten premium eksklusif untuk member.</p>
              </div>

              <div className="relative w-full md:w-auto" ref={dropdownRef}>
                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block tracking-wider">Filter Kategori</label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full md:w-56 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white px-4 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold truncate max-w-[120px]">
                      {selectedCategory === 'All' ? 'Semua Kategori' : selectedCategory}
                    </span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full md:w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 flex items-center justify-between group ${
                            selectedCategory === cat 
                            ? 'bg-red-600/10 text-red-500' 
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {cat === 'All' ? 'Tampilkan Semua' : cat}
                          {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {filteredCollections.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 gap-y-8">
                {filteredCollections.map((folder) => (
                <Link href={`/album/${folder.id}`} key={folder.id} className="block group">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-600 transition duration-300 shadow-lg relative h-full flex flex-col">
                      <div className="aspect-[3/4] relative overflow-hidden bg-zinc-800">
                        <img 
                          src={folder.thumbnailUrl} 
                          alt={folder.title} 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-4">
                          <h3 className="text-sm md:text-lg font-bold text-white leading-tight mb-1 group-hover:text-red-500 transition line-clamp-2">
                            {folder.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <FolderIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-xs text-zinc-400 font-mono">
                              {folder.mediaItems.length} Files
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
                <FolderIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-50" />
                <p className="text-zinc-500 text-lg font-medium">Tidak ada folder di kategori <span className="text-red-500 font-bold">"{selectedCategory}"</span></p>
                <button onClick={() => setSelectedCategory('All')} className="mt-4 text-sm text-white underline hover:text-red-500">Reset Filter</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'EXTERNAL' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="max-w-2xl mx-auto mb-12">
               <div className="text-center mb-6">
                 <h1 className="text-3xl font-bold mb-2">Cari Video Global</h1>
                 <p className="text-zinc-500 text-sm">Temukan jutaan video dari sumber eksternal Videq.</p>
               </div>
               
               <form onSubmit={handleSearch} className="relative group">
                 <input 
                    type="text" 
                    placeholder="Ketik kata kunci (misal: viral, chindo)..." 
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition shadow-xl placeholder-zinc-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <button 
                   type="submit"
                   disabled={isSearching}
                   className="absolute right-2 top-2 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isSearching ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <MagnifyingGlassIcon className="w-5 h-5" />
                   )}
                 </button>
               </form>
            </div>

            {isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in border border-dashed border-red-900/50 rounded-xl bg-red-900/10 mb-8">
                <SignalSlashIcon className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Server Videq Gangguan</h2>
                <p className="text-zinc-400 text-sm md:text-base max-w-md mb-6">
                    Koneksi ke server pihak ketiga sedang bermasalah atau sibuk. Silakan coba cari kata kunci lain atau kembali lagi nanti.
                </p>
                <button 
                  onClick={(e) => handleSearch(e)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition text-sm"
                >
                  Coba Lagi
                </button>
              </div>
            ) : externalVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {externalVideos.map((video, index) => (
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    key={`${video.id}-${index}`} 
                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-600 hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-video relative bg-black overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/640x360?text=No+Thumbnail"; }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/30">
                         <PlayCircleIcon className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition leading-snug" title={video.title}>
                        {video.title}
                      </h3>
                      
                      <div className="mt-auto flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-zinc-800 pt-3">
                         <span>{video.upload_date}</span>
                         <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">{video.file_size}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              !isSearching && searchQuery && (
                 <div className="text-center py-20 text-zinc-500">
                    <p className="text-lg">Tidak ada hasil ditemukan untuk "{searchQuery}".</p>
                 </div>
              )
            )}
            
            {!isSearching && !isError && externalVideos.length === 0 && !searchQuery && (
               <div className="text-center py-20 opacity-30">
                  <GlobeAltIcon className="w-20 h-20 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-500">Mulai cari video dengan mengetik di kolom pencarian.</p>
               </div>
            )}
            
          </div>
        )}

      </main>
    </div>
  );
}