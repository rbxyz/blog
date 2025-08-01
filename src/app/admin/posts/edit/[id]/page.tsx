"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { ArrowLeft, Upload, Eye, EyeOff, Save, FileText, Image, Bold, Italic, Code, Link as LinkIcon, List, ListOrdered, Quote, Hash, Loader2, Music, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    audioUrl: "",
    audioDuration: 0,
    spotifyPlaylistUrl: "",
    hasAudio: false,
    published: false,
    scheduledAt: undefined as Date | undefined,
  });
  
  const [spotifyUrlError, setSpotifyUrlError] = useState<string | null>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Query para buscar post existente
  const { data: post, isLoading: postLoading } = api.post.byId.useQuery(postId, {
    enabled: !!postId,
  });

  // Mutation para atualizar post
  const updatePostMutation = api.post.update.useMutation({
    onSuccess: () => {
      router.push(`/admin?tab=posts&success=Post atualizado com sucesso!`);
    },
    onError: (error) => {
      console.error("Erro ao atualizar post:", error);
      alert(`Erro ao atualizar post: ${error.message}`);
    },
  });

  // Validar URL do Spotify
  const validateSpotifyUrl = (url: string): boolean => {
    const spotifyRegex = /^https:\/\/open\.spotify\.com\/(playlist|album|track)\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyRegex.test(url);
  };

  const handleSpotifyUrlChange = (url: string) => {
    if (url && !validateSpotifyUrl(url)) {
      setSpotifyUrlError('URL do Spotify inválida. Use: https://open.spotify.com/playlist/...');
    } else {
      setSpotifyUrlError(null);
    }
    setFormData(prev => ({ ...prev, spotifyPlaylistUrl: url }));
  };

  // Carregar dados do post quando disponível
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title ?? "",
        content: post.content ?? "",
        imageUrl: post.imageUrl ?? "",
        audioUrl: post.audioUrl ?? "",
        audioDuration: post.audioDuration ?? 0,
        spotifyPlaylistUrl: post.spotifyPlaylistUrl ?? "",
        hasAudio: post.hasAudio ?? false,
        published: post.published ?? false,
        scheduledAt: post.scheduledAt ?? undefined,
      });
      setIsLoading(false);
    }
  }, [post]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Erro no upload da imagem");
      }

      const { imageUrl } = await response.json() as { imageUrl: string };
      handleInputChange("imageUrl", imageUrl);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleImageUpload(file);
    }
  };

  const insertMarkdown = (before: string, after = "") => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    const newText = formData.content.substring(0, start) + 
                   before + selectedText + after + 
                   formData.content.substring(end);
    
    handleInputChange("content", newText);
    
    // Restaurar posição do cursor
    void setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Título e conteúdo são obrigatórios!");
      return;
    }

    void updatePostMutation.mutate({
      id: postId,
      title: formData.title.trim(),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl ?? undefined,
      audioUrl: formData.audioUrl || undefined,
      audioDuration: formData.audioDuration || undefined,
      spotifyPlaylistUrl: formData.spotifyPlaylistUrl || undefined,
      hasAudio: formData.hasAudio,
      published: formData.published,
      scheduledAt: formData.scheduledAt ?? undefined,
    });
  };

  const handleInlineImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Erro no upload da imagem");
      }

      const { imageUrl } = await response.json() as { imageUrl: string };
      
      // Inserir a imagem na posição atual do cursor
      const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![Descrição da imagem](${imageUrl})`;
        
        const newContent = 
          formData.content.substring(0, start) + 
          imageMarkdown + 
          formData.content.substring(end);
        
        handleInputChange("content", newContent);
        
        // Posicionar cursor após a imagem inserida
        void setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + imageMarkdown.length, 
            start + imageMarkdown.length
          );
        }, 0);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerInlineImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        void handleInlineImageUpload(file);
      }
    };
    input.click();
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**"), title: "Negrito" },
    { icon: Italic, action: () => insertMarkdown("*", "*"), title: "Itálico" },
    { icon: Code, action: () => insertMarkdown("`", "`"), title: "Código inline" },
    { icon: LinkIcon, action: () => insertMarkdown("[", "](url)"), title: "Link" },
    { icon: Image, action: triggerInlineImageUpload, title: "Inserir imagem" },
    { icon: List, action: () => insertMarkdown("- "), title: "Lista" },
    { icon: ListOrdered, action: () => insertMarkdown("1. "), title: "Lista numerada" },
    { icon: Quote, action: () => insertMarkdown("> "), title: "Citação" },
    { icon: Hash, action: () => insertMarkdown("## "), title: "Cabeçalho" },
  ];

  if (postLoading || isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Post não encontrado</p>
          <Link
            href="/admin"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium transition-all duration-300 hover:scale-105"
          >
            Voltar ao Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/admin"
              className="group inline-flex items-center space-x-2 glass-card rounded-xl px-4 py-2 mb-4 hover:shadow-glow transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors group-hover:-translate-x-1" />
              <span className="text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Voltar ao Admin
              </span>
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              Editar Post
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Edite seu post usando Markdown com preview em tempo real
            </p>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="group relative px-4 py-2 rounded-xl glass-card hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            {showPreview ? (
              <EyeOff className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
            <span className="ml-2 text-slate-600 dark:text-slate-400">
              {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <FileText className="w-4 h-4 inline mr-2" />
              Título do Post
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título do seu post..."
              className="w-full p-4 rounded-xl glass border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200 text-lg font-medium"
              required
            />
          </div>

          {/* Imagem de Capa */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Image className="w-4 h-4 inline mr-2" />
              Imagem de Capa (opcional)
            </label>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? "Enviando..." : "Fazer Upload"}</span>
                </button>
                
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  ou cole a URL da imagem abaixo
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full p-3 rounded-xl glass border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200"
              />

              {/* Preview da imagem */}
              {formData.imageUrl && (
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img
                    src={formData.imageUrl}
                    alt="Preview da imagem de capa"
                    className="relative w-full max-h-64 object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Áudio do Post */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Music className="w-4 h-4 inline mr-2" />
              Áudio do Post (Podcast)
            </label>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  URL do Áudio (opcional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => handleInputChange("audioUrl", e.target.value)}
                    placeholder="https://exemplo.com/audio.mp3"
                    className="flex-1 p-3 rounded-xl glass border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200"
                  />
                  {formData.audioUrl && (
                    <button
                      type="button"
                      onClick={() => handleInputChange("audioUrl", "")}
                      className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                      title="Remover áudio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adicione uma URL de áudio para criar um post de podcast
                </p>
              </div>

              {/* URL da Playlist do Spotify */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  URL da Playlist do Spotify (opcional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={formData.spotifyPlaylistUrl}
                    onChange={(e) => handleSpotifyUrlChange(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className={`flex-1 p-3 rounded-xl glass border ${
                      spotifyUrlError 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-slate-200/50 dark:border-slate-700/50'
                    } bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200`}
                  />
                  {formData.spotifyPlaylistUrl && (
                    <button
                      type="button"
                      onClick={() => handleSpotifyUrlChange('')}
                      className="px-3 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                      title="Remover URL do Spotify"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {spotifyUrlError && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {spotifyUrlError}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adicione uma playlist relacionada ao conteúdo do post
                </p>
              </div>

              {/* Status de Áudio */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.hasAudio}
                    onChange={(e) => handleInputChange("hasAudio", e.target.checked.toString())}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Este post contém áudio/podcast
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Status de Publicação */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Eye className="w-4 h-4 inline mr-2" />
              Status de Publicação
            </label>
            
            <div className="space-y-4">
              {/* Status atual */}
              <div className="p-4 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Atual:</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    formData.published 
                      ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      : formData.scheduledAt
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {formData.published ? "Publicado" : formData.scheduledAt ? "Agendado" : "Rascunho"}
                  </span>
                </div>
                
                {formData.scheduledAt && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Agendado para: {new Date(formData.scheduledAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Opções de publicação */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={formData.published && !formData.scheduledAt}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        published: true,
                        scheduledAt: undefined
                      }));
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Publicar imediatamente
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={!formData.published && !formData.scheduledAt}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        published: false,
                        scheduledAt: undefined
                      }));
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Manter como rascunho
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="publishStatus"
                    checked={!formData.published && !!formData.scheduledAt}
                    onChange={() => {
                      // Manter agendamento se já existir
                      if (!formData.scheduledAt) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0);
                        setFormData(prev => ({
                          ...prev,
                          published: false,
                          scheduledAt: tomorrow
                        }));
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Agendar publicação
                  </span>
                </label>
              </div>

              {/* Agendamento */}
              {!formData.published && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data e Hora de Publicação
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setFormData(prev => ({
                        ...prev,
                        scheduledAt: date
                      }));
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full p-3 rounded-xl glass border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Editor de Conteúdo */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="border-b border-slate-200/20 dark:border-slate-700/20 p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Conteúdo (Markdown)
              </label>
              
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {toolbarButtons.map((button, index) => {
                  const Icon = button.icon;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={button.action}
                      title={button.title}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"} min-h-[500px]`}>
              {/* Editor */}
              <div className={`relative ${isUploading ? 'uploading-indicator' : ''}`}>
                <textarea
                  id="content-textarea"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    const imageFile = files.find(file => file.type.startsWith('image/'));
                    if (imageFile) {
                      void handleInlineImageUpload(imageFile);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('drag-over');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('drag-over');
                  }}
                  onPaste={(e) => {
                    const items = Array.from(e.clipboardData.items);
                    const imageItem = items.find(item => item.type.startsWith('image/'));
                    if (imageItem) {
                      e.preventDefault();
                      const file = imageItem.getAsFile();
                      if (file) {
                        void handleInlineImageUpload(file);
                      }
                    }
                  }}
                  placeholder="Digite o conteúdo do seu post usando Markdown...

📝 Dicas para inserir imagens:
• Use o botão 🖼️ na toolbar
• Arraste e solte arquivos aqui
• Cole (Ctrl+V) imagens da área de transferência"
                  className="w-full h-full min-h-[500px] p-6 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none resize-none font-mono text-sm leading-relaxed transition-all duration-200"
                  required
                />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border-l border-slate-200/20 dark:border-slate-700/20 bg-slate-50/30 dark:bg-slate-800/30">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:gradient-text prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-code:text-secondary-600 dark:prose-code:text-secondary-400 prose-pre:bg-slate-800 prose-pre:text-slate-100">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          img: ({ src, alt }) => (
                            <div className="my-8 text-center">
                              <img 
                                src={src} 
                                alt={alt ?? 'Imagem'}
                                className="rounded-xl shadow-lg max-w-full mx-auto block"
                                style={{ maxWidth: '100%', height: 'auto' }}
                              />
                              {alt && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">
                                  {alt}
                                </p>
                              )}
                            </div>
                          ),
                        }}
                      >
                        {formData.content ?? "*Preview do conteúdo aparecerá aqui...*"}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl glass-card text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all duration-300 hover:scale-105"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={updatePostMutation.isPending || !formData.title.trim() || !formData.content.trim()}
              className="group relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-glow"></div>
              <span className="relative z-10 text-white flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>
                  {updatePostMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}