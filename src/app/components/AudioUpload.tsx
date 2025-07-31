'use client';

import { useState, useRef } from 'react';
import { Upload, Music, X, CheckCircle, AlertCircle } from 'lucide-react';

interface AudioUploadProps {
  onUpload: (file: File, duration: number) => void;
  onRemove: () => void;
  currentAudioUrl?: string;
  className?: string;
}

export default function AudioUpload({ onUpload, onRemove, currentAudioUrl, className = '' }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      void handleFileUpload(audioFile);
    } else {
      setError('Por favor, selecione um arquivo de áudio válido');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('audio/')) {
      setError('Por favor, selecione um arquivo de áudio válido (MP3, WAV, M4A, etc.)');
      return;
    }

    // Validar tamanho (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('O arquivo é muito grande. Tamanho máximo: 50MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Simular upload - em produção, você faria upload para um serviço como AWS S3
      const duration = await getAudioDuration(file);
      
      setUploadedFile(file);
      onUpload(file, duration);
      
      // Simular delay de upload
      setTimeout(() => {
        setUploading(false);
      }, 2000);
      
    } catch {
      setError('Erro ao processar o arquivo de áudio');
      setUploading(false);
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Erro ao carregar áudio'));
      });
      
      audio.src = url;
    });
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!uploadedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Upload de Áudio
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Arraste e solte um arquivo de áudio ou clique para selecionar
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                <Music className="w-4 h-4" />
                <span>Selecionar Arquivo</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-500">
              Formatos suportados: MP3, WAV, M4A, OGG • Máximo: 50MB
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Arquivo Carregado
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {uploadedFile.name}
                  </span>
                  <button
                    onClick={handleRemove}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>{formatFileSize(uploadedFile.size)}</span>
                  <span>{formatDuration(uploadedFile.size / 1000000 * 60)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Processando áudio...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Current Audio Info */}
      {currentAudioUrl && !uploadedFile && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Music className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Áudio atual carregado
              </span>
            </div>
            <button
              onClick={handleRemove}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 