// src/components/admin/upload-movie/FolderList.tsx
import { FolderPlusIcon } from '@heroicons/react/24/outline';
import { Album } from './types';

interface FolderListProps {
  folders: Album[];
  onSelect: (folder: Album) => void;
}

export default function FolderList({ folders, onSelect }: FolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-3xl">
        <FolderPlusIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Belum ada folder konten.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {folders.map((folder) => (
        <div 
          key={folder.id} 
          onClick={() => onSelect(folder)} 
          className="group cursor-pointer bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-600 transition-all hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1 relative"
        >
          <div className="aspect-[2/3] relative">
            <img src={folder.thumbnailUrl} alt={folder.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-4 flex flex-col justify-end">
              <div className="flex flex-wrap gap-1 mb-2">
                {folder.categories?.slice(0, 2).map(cat => (
                  <span key={cat.id} className="text-[9px] bg-red-600/90 text-white px-1.5 py-0.5 rounded font-bold uppercase shadow-sm backdrop-blur-sm">{cat.name}</span>
                ))}
                {folder.categories?.length > 2 && (
                  <span className="text-[9px] bg-zinc-700 text-white px-1.5 py-0.5 rounded font-bold uppercase">+{folder.categories.length - 2}</span>
                )}
              </div>
              <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md line-clamp-2">{folder.title}</h3>
              <p className="text-zinc-400 text-xs mt-1 font-medium">{folder.mediaItems?.length || 0} Item</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}