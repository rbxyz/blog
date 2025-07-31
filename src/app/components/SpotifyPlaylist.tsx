'use client';

import { useState, useEffect } from 'react';
import { Music, ExternalLink, Play } from 'lucide-react';

interface SpotifyPlaylistProps {
  playlistUrl: string;
  className?: string;
}

interface SpotifyPlaylistData {
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export default function SpotifyPlaylist({ playlistUrl, className = '' }: SpotifyPlaylistProps) {
  const [playlistData, setPlaylistData] = useState<SpotifyPlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validar URL do Spotify
  const validateSpotifyUrl = (url: string): boolean => {
    const spotifyRegex = /^https:\/\/open\.spotify\.com\/(playlist|album|track)\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyRegex.test(url);
  };

  // Extrair ID da playlist da URL
  const extractPlaylistId = (url: string) => {
    if (!validateSpotifyUrl(url)) {
      return null;
    }
    const regex = /(playlist|album|track)\/([a-zA-Z0-9]+)/;
    const match = regex.exec(url);
    return match ? match[2] : null;
  };

  useEffect(() => {
    if (!playlistUrl) {
      setIsLoading(false);
      return;
    }

    if (!validateSpotifyUrl(playlistUrl)) {
      setError('URL do Spotify inválida. Use: https://open.spotify.com/playlist/...');
      setIsLoading(false);
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Não foi possível extrair o ID da playlist');
      setIsLoading(false);
      return;
    }

    // Para demonstração, vamos simular dados da playlist
    // Em produção, você precisaria da API do Spotify
    const mockPlaylistData: SpotifyPlaylistData = {
      name: 'Playlist Relacionada',
      description: 'Músicas selecionadas para acompanhar este conteúdo',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
        }
      ],
      tracks: {
        total: 15
      },
      external_urls: {
        spotify: playlistUrl
      }
    };

    // Simular carregamento
    setTimeout(() => {
      setPlaylistData(mockPlaylistData);
      setIsLoading(false);
    }, 1000);
  }, [playlistUrl]);

  if (isLoading) {
    return (
      <div className={`glass-card rounded-2xl p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error ?? !playlistData) {
    return (
      <div className={`glass-card rounded-2xl p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Erro ao carregar playlist</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {error ?? 'Não foi possível carregar a playlist do Spotify'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <div className="relative">
          <img
            src={playlistData.images[0]?.url ?? '/placeholder-playlist.jpg'}
            alt={`Capa da playlist ${playlistData.name}`}
            className="w-16 h-16 rounded-xl object-cover shadow-lg"
          />
          <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 truncate">
            {playlistData.name}
          </h3>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
            {playlistData.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
              <span>{playlistData.tracks.total} músicas</span>
              <span>•</span>
              <span>Spotify</span>
            </div>
            
            <a
              href={playlistData.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Abrir</span>
            </a>
          </div>
        </div>
      </div>

      {/* Spotify Branding */}
      <div className="mt-4 pt-4 border-t border-slate-200/20 dark:border-slate-700/20">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
              <Play className="w-2 h-2 text-white" />
            </div>
            <span>Spotify</span>
          </div>
          <span>Playlist relacionada</span>
        </div>
      </div>
    </div>
  );
} 