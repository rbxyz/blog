'use client';

import { useState, useEffect } from 'react';
import { Play, ExternalLink, Music, Clock } from 'lucide-react';

interface SpotifyPlaylistProps {
  playlistUrl: string;
  className?: string;
}

interface SpotifyPlaylistData {
  name: string;
  description: string;
  images: Array<{
    url: string;
  }>;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
  type: 'playlist' | 'album' | 'track';
  duration_ms?: number;
  artists?: Array<{
    name: string;
  }>;
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

  // Extrair tipo (playlist, album, track)
  const extractType = (url: string): 'playlist' | 'album' | 'track' => {
    if (url.includes('/playlist/')) return 'playlist';
    if (url.includes('/album/')) return 'album';
    if (url.includes('/track/')) return 'track';
    return 'playlist';
  };

  // Formatar duração
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

    const type = extractType(playlistUrl);

    // Extrair informações da URL para mostrar dados mais realistas
    const getRealisticData = (): SpotifyPlaylistData => {
      if (type === 'track') {
        // Para tracks, tentar extrair informações da URL
        const trackId = playlistId;
        return {
          name: 'Música Relacionada',
          description: 'Música selecionada para acompanhar este conteúdo',
          images: [
            {
              url: `https://i.scdn.co/image/ab67616d0000b273${trackId}`
            }
          ],
          tracks: { total: 1 },
          external_urls: { spotify: playlistUrl },
          type,
          duration_ms: 180000, // 3 minutos
          artists: [{ name: 'Artista' }],
        };
      } else {
        // Para playlists e álbuns
        return {
          name: type === 'playlist' ? 'Playlist Relacionada' : 'Álbum Relacionado',
          description: type === 'playlist' 
            ? 'Músicas selecionadas para acompanhar este conteúdo'
            : 'Álbum selecionado para acompanhar este conteúdo',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
            }
          ],
          tracks: { total: type === 'playlist' ? 15 : 12 },
          external_urls: { spotify: playlistUrl },
          type,
        };
      }
    };

    const playlistData = getRealisticData();

    // Simular carregamento
    setTimeout(() => {
      setPlaylistData(playlistData);
      setIsLoading(false);
    }, 500);
  }, [playlistUrl]);

  if (isLoading) {
    return (
      <div className={`glass-card rounded-2xl p-6 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-card rounded-2xl p-6 border border-red-200 dark:border-red-800 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-red-600 dark:text-red-400 font-medium">Erro no Spotify</p>
            <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!playlistData) {
    return null;
  }

  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      {/* Layout Vertical */}
      <div className="space-y-4">
        {/* Imagem e Informações Principais */}
        <div className="flex items-start space-x-4">
          {/* Imagem */}
          <div className="flex-shrink-0">
            <img
              src={playlistData.images[0]?.url}
              alt={playlistData.name}
              className="w-20 h-20 rounded-lg object-cover shadow-lg"
            />
          </div>

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
              {playlistData.name}
            </h3>
            
            {playlistData.type === 'track' && playlistData.artists && (
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                {playlistData.artists[0]?.name}
              </p>
            )}
            
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {playlistData.description}
            </p>
            
            {playlistData.type === 'track' && playlistData.duration_ms && (
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 mt-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(playlistData.duration_ms)}</span>
              </div>
            )}
          </div>

          {/* Botão Play */}
          <div className="flex-shrink-0">
            <a
              href={playlistData.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <Play className="w-5 h-5 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Player do Spotify */}
        <div className="mt-6">
          <iframe
            src={`https://open.spotify.com/embed/${playlistData.type}/${extractPlaylistId(playlistUrl)}`}
            width="100%"
            height={playlistData.type === 'track' ? "80" : "152"}
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg shadow-sm"
          ></iframe>
        </div>

        {/* Botão para ouvir no Spotify */}
        <div className="pt-2">
          <a
            href={playlistData.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ouvir no Spotify</span>
          </a>
        </div>
      </div>
    </div>
  );
} 