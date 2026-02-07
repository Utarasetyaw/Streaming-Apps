'use client';

import { useState } from 'react';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

// Definisikan tipe data yang dibutuhkan player
interface Episode {
  episode: number;
  title: string;
  playerUrl: string;
}

interface Season {
  season: number;
  episodes: Episode[];
}

interface PlayerProps {
  initialUrl: string; // URL default (film atau episode 1)
  seasons?: Season[]; // Opsional, hanya ada jika TV Series
  type: string;       // 'movie' atau 'tv'
}

export default function VideoPlayer({ initialUrl, seasons, type }: PlayerProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [activeEp, setActiveEp] = useState<number>(1);
  const [activeSeason, setActiveSeason] = useState<number>(1);

  // Ambil list episode berdasarkan season yang aktif
  const currentSeasonEpisodes = seasons?.find(s => s.season === activeSeason)?.episodes || [];

  return (
    <div className="space-y-6">
      {/* PLAYER IFRAME */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        <iframe
          src={currentUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Video Player"
        />
      </div>

      {/* EPISODE SELECTOR (Hanya Muncul Jika TV Series) */}
      {type === 'tv' && seasons && seasons.length > 0 && (
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
             <PlayCircleIcon className="w-5 h-5 text-red-600" />
             Pilih Episode
          </h3>
          
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {currentSeasonEpisodes.map((ep) => (
              <button
                key={ep.episode}
                onClick={() => {
                  setCurrentUrl(ep.playerUrl);
                  setActiveEp(ep.episode);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded transition text-xs font-medium ${
                  activeEp === ep.episode
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <span>Eps {ep.episode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}