// src/components/admin/upload-movie/FolderDetail.tsx
import { TrashIcon, PlusIcon, VideoCameraIcon, PhotoIcon, PlayCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Album, MediaItem } from './types';

interface FolderDetailProps {
  folder: Album;
  onDeleteFolder: () => void;
  onAddMedia: () => void;
  onPreviewMedia: (item: MediaItem) => void;
  onDeleteMedia: (id: number) => void;
}

export default function FolderDetail({ folder, onDeleteFolder, onAddMedia, onPreviewMedia, onDeleteMedia }: FolderDetailProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header Info */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="flex items-start md:items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
          <img src={folder.thumbnailUrl} className="w-20 h-28 md:w-24 md:h-36 object-cover rounded-xl border border-zinc-700 shadow-2xl flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {folder.categories?.map(cat => (
                <span key={cat.id} className="inline-block text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase tracking-wider">{cat.name}</span>
              ))}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 truncate pr-2">{folder.title}</h3>
            <p className="text-zinc-400 text-sm">{folder.mediaItems.length} File Media</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
          <button onClick={onDeleteFolder} className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-zinc-700 hover:border-red-500 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 px-5 py-3 rounded-xl font-bold transition text-sm whitespace-nowrap">
            <TrashIcon className="w-5 h-5" /> Hapus
          </button>
          <button onClick={onAddMedia} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-white/10 active:scale-95 text-sm whitespace-nowrap">
            <PlusIcon className="w-5 h-5" /> Tambah Media
          </button>
        </div>
      </div>

      {/* Media List */}
      <div className="space-y-4">
        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {folder.mediaItems.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2.5 rounded-lg flex-shrink-0 ${item.type === 'VIDEO' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {item.type === 'VIDEO' ? <VideoCameraIcon className="w-5 h-5" /> : <PhotoIcon className="w-5 h-5" />}
                </div>
                <span className="font-medium text-white truncate text-sm">{item.name}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onPreviewMedia(item)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"><PlayCircleIcon className="w-5 h-5" /></button>
                <button onClick={() => onDeleteMedia(item.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-black/30 text-zinc-500 font-bold uppercase text-xs tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 w-24 text-center">Tipe</th>
                <th className="px-6 py-4">Nama File</th>
                <th className="px-6 py-4 w-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {folder.mediaItems.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition group">
                  <td className="px-6 py-4 text-center">
                    {item.type === 'VIDEO' ? <span className="inline-flex p-2 bg-blue-500/10 text-blue-500 rounded-lg"><VideoCameraIcon className="w-5 h-5" /></span> : <span className="inline-flex p-2 bg-purple-500/10 text-purple-500 rounded-lg"><PhotoIcon className="w-5 h-5" /></span>}
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{item.name}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onPreviewMedia(item)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"><PlayCircleIcon className="w-5 h-5" /></button>
                      <button onClick={() => onDeleteMedia(item.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}