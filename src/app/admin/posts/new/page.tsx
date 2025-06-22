"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import { ArrowLeft, Upload, Eye, EyeOff, Save, FileText, Image, Bold, Italic, Code, Link as LinkIcon, List, ListOrdered, Quote, Hash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });
  
      const [showPreview, setShowPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

  // Teste de autenticação
  useEffect(() => {
    const testAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        const data = await response.json() as { user?: { name?: string } };
        console.log("🔐 Status de autenticação:", {
          status: response.status,
          authenticated: response.ok,
          user: data.user ?? null
        });
      } catch (error) {
        console.error("❌ Erro ao verificar autenticação:", error);
      }
    };
    void testAuth();
  }, []);

  // Mutation para criar post
  const createPostMutation = api.post.create.useMutation({
    onMutate: (variables) => {
      console.log("🔄 onMutate - Iniciando mutation com dados:", variables);
    },
    onSuccess: (data) => {
      console.log("✅ onSuccess - Post criado com sucesso:", data);
      alert("Post criado com sucesso!");
      router.push(`/admin?tab=posts&success=Post criado com sucesso!`);
    },
    onError: (error) => {
      console.error("❌ onError - Erro detalhado ao criar post:", {
        message: error.message,
        data: error.data,
        shape: error.shape
      });
      alert(`Erro ao criar post: ${error.message}\n\nVerifique o console para mais detalhes.`);
    },
    onSettled: (data, error) => {
      console.log("🏁 onSettled - Mutation finalizada:", { data, error });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    // Só loga mudanças nos campos principais
    if (field === 'title' || field === 'imageUrl') {
      console.log(`📝 ${field} alterado:`, value);
    }
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
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📝 handleSubmit chamado!");
    console.log("📋 Dados do formulário:", formData);
    
    if (!formData.title.trim() || !formData.content.trim()) {
      console.log("❌ Validação falhou - título ou conteúdo vazio");
      alert("Título e conteúdo são obrigatórios!");
      return;
    }

    console.log("✅ Validação passou");

    const postData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      imageUrl: formData.imageUrl ?? undefined,
    };

    console.log("🚀 Tentando criar post com dados:", postData);
    console.log("📊 Status da mutation antes:", {
      isPending: createPostMutation.isPending,
      isError: createPostMutation.isError,
      error: createPostMutation.error,
      isSuccess: createPostMutation.isSuccess
    });

    try {
      console.log("🔄 Chamando createPostMutation.mutate...");
      void createPostMutation.mutate(postData);
      console.log("✅ Mutation chamada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao chamar mutation:", error);
    }
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
              Criar Novo Post
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Escreva seu post usando Markdown com preview em tempo real
            </p>
          </div>

                      <div className="flex items-center space-x-4">
                              <button
                  onClick={async () => {
                    try {
                      console.log("🧪 Testando conexão tRPC...");
                      // Testar com uma query mais simples
                      const response = await fetch('/api/trpc/post.getAll?input={}', {
                        method: 'GET',
                        credentials: 'include'
                      });
                      console.log("✅ tRPC resposta:", response.status);
                      alert(`tRPC Status: ${response.status}`);
                    } catch (error) {
                      console.error("❌ Erro no tRPC:", error);
                      alert(`Erro no tRPC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Teste tRPC
                </button>

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
        </div>

        <form 
          onSubmit={(e) => {
            console.log("📝 Form onSubmit chamado!");
            void handleSubmit(e);
          }} 
          className="space-y-6"
        >
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
                    alt="Preview"
                    className="relative w-full max-h-64 object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
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
                    // Só processa paste se o textarea está focado
                    if (document.activeElement !== e.currentTarget) return;
                    
                    const items = Array.from(e.clipboardData.items);
                    const imageItem = items.find(item => item.type.startsWith('image/'));
                    if (imageItem) {
                      e.preventDefault();
                      const file = imageItem.getAsFile();
                      if (file) {
                        console.log('📋 Paste de imagem detectado no textarea');
                        void handleInlineImageUpload(file);
                      }
                    }
                  }}
                  placeholder="Digite o conteúdo do seu post usando Markdown...

📝 Dicas para inserir imagens:
• Use o botão 🖼️ na toolbar
• Arraste e solte arquivos aqui
• Cole (Ctrl+V) imagens da área de transferência

Exemplo:
# Título
## Subtítulo

**Texto em negrito** e *texto em itálico*

```javascript
const exemplo = 'código';
```

- Lista item 1
- Lista item 2

> Citação em bloco

[Link](https://exemplo.com)"
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
                        {formData.content || "*Preview do conteúdo aparecerá aqui...*"}
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
                type="button"
                onClick={async () => {
                  console.log("🔍 Estado atual do formulário:", formData);
                  console.log("📊 Status atual da mutation:", {
                    isPending: createPostMutation.isPending,
                    isError: createPostMutation.isError,
                    isSuccess: createPostMutation.isSuccess,
                    error: createPostMutation.error
                  });
                  
                  alert(`Formulário:\n- Título: ${formData.title.length} chars\n- Conteúdo: ${formData.content.length} chars\n- Imagem: ${formData.imageUrl ? 'Sim' : 'Não'}\n\nVerifique o console para detalhes completos.`);
                }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
              >
                🔍 Ver Estado
              </button>

              <button
                type="button"
                onClick={async () => {
                  const testData = {
                    title: "Post de Teste - " + Date.now(),
                    content: "Este é um conteúdo de teste para verificar se a mutation funciona corretamente.",
                    imageUrl: undefined,
                  };
                  
                  console.log("🧪 Testando com dados fake:", testData);
                  
                  try {
                    void createPostMutation.mutate(testData);
                    console.log("✅ Mutation de teste chamada");
                  } catch (error) {
                    console.error("❌ Erro no teste:", error);
                  }
                }}
                className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 mr-4"
              >
                🧪 Teste Direto
              </button>

            <button
              type="button"
              disabled={createPostMutation.isPending || !formData.title.trim() || !formData.content.trim()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🎯 Botão Criar Post clicado DIRETAMENTE!");
                
                if (!formData.title.trim() || !formData.content.trim()) {
                  alert("Título e conteúdo são obrigatórios!");
                  return;
                }

                const postData = {
                  title: formData.title.trim(),
                  content: formData.content.trim(),
                  imageUrl: formData.imageUrl ?? undefined,
                };

                console.log("🚀 Chamando mutation DIRETAMENTE:", postData);
                void createPostMutation.mutate(postData);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>
                  {createPostMutation.isPending ? "Criando..." : "Criar Post DIRETO"}
                </span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}