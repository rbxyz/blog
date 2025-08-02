"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Plus, Edit, Trash2, Eye, MessageSquare, Users, FileText, TrendingUp, CheckCircle, XCircle, RotateCcw, Mail, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const { data: posts } = api.post.getAll.useQuery();
  const { data: comments } = api.comment.getAll.useQuery();
  const { data: newsletterStats } = api.newsletter.getStats.useQuery();
  const { data: smtpConfig } = api.newsletter.getSmtpConfig.useQuery();
  const { data: subscribers } = api.newsletter.getSubscribers.useQuery({ page: 1, limit: 10 });

  // Newsletter mutations
  const updateSmtpConfigMutation = api.newsletter.updateSmtpConfig.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const sendNewsletterMutation = api.newsletter.sendNewsletter.useMutation({
    onSuccess: (data) => {
      alert(data.message);
      window.location.reload();
    },
  });

  // State para newsletter
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [smtpFormData, setSmtpFormData] = useState({
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "",
    isActive: false,
  });

  // Atualizar dados do formulário quando smtpConfig for carregado
  useEffect(() => {
    if (smtpConfig) {
      setSmtpFormData({
        host: smtpConfig.host ?? "",
        port: smtpConfig.port ?? 587,
        secure: smtpConfig.secure ?? false,
        username: smtpConfig.username ?? "",
        password: smtpConfig.password ?? "",
        fromEmail: smtpConfig.fromEmail ?? "",
        fromName: smtpConfig.fromName ?? "",
        isActive: smtpConfig.isActive ?? false,
      });
    }
  }, [smtpConfig]);

  const handleSmtpSubmit = () => {
    // Validar dados obrigatórios
    if (!smtpFormData.host || !smtpFormData.port || !smtpFormData.username || 
        !smtpFormData.password || !smtpFormData.fromEmail || !smtpFormData.fromName) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar porta
    if (smtpFormData.port < 1 || smtpFormData.port > 65535) {
      alert("Porta deve estar entre 1 e 65535");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(smtpFormData.fromEmail)) {
      alert("Email do remetente inválido");
      return;
    }

    console.log("Enviando dados SMTP:", smtpFormData);
    updateSmtpConfigMutation.mutate(smtpFormData);
  };

  const handleSendNewsletter = () => {
    if (!selectedPostId) {
      alert("Selecione um post para enviar a newsletter");
      return;
    }
    sendNewsletterMutation.mutate({ postId: selectedPostId });
  };

  const handleGenerateHTML = () => {
    if (!selectedPostId) {
      alert("Selecione um post para gerar o HTML");
      return;
    }
    
    // Usar uma query com refetch
    const { refetch } = api.newsletter.generateNewsletterHTML.useQuery(
      { postId: selectedPostId },
      { enabled: false }
    );
    
    refetch().then((result) => {
      if (result.data?.success && result.data.html) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(result.data.html);
          newWindow.document.close();
        }
      }
    }).catch((error) => {
      console.error("Erro ao gerar HTML:", error);
      alert("Erro ao gerar HTML da newsletter");
    });
  };

  // Mutations
  const deletePostMutation = api.post.delete.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const togglePublishMutation = api.post.togglePublished.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const deleteCommentMutation = api.comment.delete.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const restoreCommentMutation = api.comment.restore.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleDeletePost = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      void deletePostMutation.mutate({ id });
    }
  };

  const handleTogglePublish = (id: string, published: boolean) => {
    void togglePublishMutation.mutate({ id, published: !published });
  };

  const handleDeleteComment = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este comentário?")) {
      void deleteCommentMutation.mutate({ id });
    }
  };

  const handleRestoreComment = (id: string) => {
    if (confirm("Tem certeza que deseja restaurar este comentário?")) {
      void restoreCommentMutation.mutate({ id });
    }
  };

  // Calcular estatísticas
  const totalPosts = posts?.length ?? 0;
  const publishedPosts = posts?.filter(post => post.published).length ?? 0;
  const totalViews = posts?.reduce((sum, post) => sum + (post.viewCount ?? 0), 0) ?? 0;
  const totalComments = comments?.length ?? 0;
      const activeComments = comments?.filter(comment => !comment.isDeleted).length ?? 0;

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: TrendingUp },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "comments", label: "Comentários", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: Eye },
    { id: "newsletter", label: "Newsletter", icon: Mail },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Painel Administrativo
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie seu blog, posts e comentários
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center space-x-1 glass-card rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {totalPosts}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Posts criados
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Publicados
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {publishedPosts}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Posts publicados
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Visualizações
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {totalViews.toLocaleString()}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Total de views
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Comentários
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {activeComments}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Comentários ativos
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/admin/posts/new"
                  className="group p-4 glass rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        Novo Post
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Criar novo artigo
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/notifications"
                  className="group p-4 glass rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        Notificações
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Testar sistema
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/metrics"
                  className="group p-4 glass rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        Métricas
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        KPIs e análises
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/newsletter/subscribers"
                  className="group p-4 glass rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        Inscritos
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Lista de emails
                      </p>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setActiveTab("newsletter")}
                  className="group p-4 glass rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        Newsletter
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Gerenciar emails
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Atividade Recente
              </h2>
              <div className="space-y-4">
                {posts?.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 glass rounded-xl">
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Criado em {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        post.published 
                          ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                          : post.scheduledAt
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                      }`}>
                        {post.published ? "Publicado" : post.scheduledAt ? "Agendado" : "Rascunho"}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {post.viewCount ?? 0} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Gerenciar Posts
              </h2>
              <Link
                href="/admin/posts/new"
                className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-glow"></div>
                <span className="relative z-10 text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Novo Post</span>
                </span>
              </Link>
            </div>

            {/* Posts List */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200/20 dark:border-slate-700/20">
                    <tr>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                        Título
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                        Status
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                        Views
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                        Data
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts?.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-slate-200/10 dark:border-slate-700/10 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <h3 className="font-medium text-slate-800 dark:text-slate-200">
                              {post.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              /{post.slug}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              post.published 
                                ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                : post.scheduledAt
                                ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                            }`}>
                              {post.published ? "Publicado" : post.scheduledAt ? "Agendado" : "Rascunho"}
                            </span>
                            {post.scheduledAt && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(post.scheduledAt).toLocaleDateString('pt-BR')} às {new Date(post.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {post.viewCount ?? 0}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/post/${post.slug}`}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/posts/edit/${post.id}`}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleTogglePublish(post.id, post.published)}
                              className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                                post.published 
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {post.published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Gerenciar Comentários
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total: {totalComments} | Ativos: {activeComments}
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div
                  key={comment.id}
                  className={`glass-card rounded-xl p-6 transition-all duration-300 ${
                    comment.isDeleted ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {comment.author.name ?? comment.author.email.split('@')[0]}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {comment.author.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {comment.isDeleted ? (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                          Deletado
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span>
                        Post: <Link 
                          href={`/post/${comment.post.slug}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {comment.post.title}
                        </Link>
                      </span>
                      <span>
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {comment.isDeleted ? (
                        <button
                          onClick={() => handleRestoreComment(comment.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          title="Restaurar comentário"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Deletar comentário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {comments?.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Nenhum comentário encontrado.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Estatísticas de Visualizações
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Total
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {totalViews.toLocaleString()}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Visualizações totais
                  </p>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Únicas
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {posts?.reduce((sum, post) => sum + (post.viewCount ?? 0), 0)?.toLocaleString() ?? 0}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Visualizações únicas
                  </p>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Posts
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {publishedPosts}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Posts publicados
                  </p>
                </div>
              </div>

              {/* Posts mais visualizados */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Posts Mais Visualizados
                </h3>
                {posts?.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 glass rounded-xl">
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        {post.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {post.viewCount ?? 0} visualizações
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                        {post.viewCount?.toLocaleString() ?? 0} views
                      </span>
                      <Link 
                        href={`/api/posts/${post.slug}/stats`}
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Ver estatísticas detalhadas"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === "newsletter" && (
          <div className="space-y-8">
            {/* Newsletter Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Inscritos
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {newsletterStats?.activeSubscribers?.toLocaleString() ?? 0}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Inscritos ativos
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Enviados
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {newsletterStats?.totalEmailsSent?.toLocaleString() ?? 0}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Emails enviados
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Taxa Abertura
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {newsletterStats?.openRate?.toFixed(1) ?? 0}%
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Taxa de abertura
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Taxa Clique
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {newsletterStats?.clickRate?.toFixed(1) ?? 0}%
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Taxa de clique
                </p>
              </div>
            </div>

            {/* SMTP Configuration */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Configuração SMTP
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={smtpFormData.host}
                    onChange={(e) => setSmtpFormData({ ...smtpFormData, host: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={smtpFormData.port}
                    onChange={(e) => setSmtpFormData({ ...smtpFormData, port: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="587"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Usuário/Email
                  </label>
                  <input
                    type="text"
                    value={smtpFormData.username}
                    onChange={(e) => setSmtpFormData({ ...smtpFormData, username: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email do Remetente
                  </label>
                  <input
                    type="email"
                    value={smtpFormData.fromEmail}
                    onChange={(e) => setSmtpFormData({ ...smtpFormData, fromEmail: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nome do Remetente
                  </label>
                  <input
                    type="text"
                    value={smtpFormData.fromName}
                    onChange={(e) => setSmtpFormData({ ...smtpFormData, fromName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Blog Ruan"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Senha/Token
                  </label>
                  <input
                    type="password"
                    value={smtpFormData.password}
                    onChange={(e) => setSmtpFormData({ ...smtpFormData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Sua senha ou token de app"
                  />
                </div>
                
                <div className="md:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={smtpFormData.secure}
                      onChange={(e) => setSmtpFormData({ ...smtpFormData, secure: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Conexão segura (SSL/TLS)</span>
                  </label>
                </div>
                
                <div className="md:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={smtpFormData.isActive}
                      onChange={(e) => setSmtpFormData({ ...smtpFormData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Ativar configuração</span>
                  </label>
                </div>
                
                <div className="md:col-span-2 flex gap-4">
                  <button 
                    onClick={handleSmtpSubmit}
                    disabled={updateSmtpConfigMutation.isPending}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {updateSmtpConfigMutation.isPending ? "Salvando..." : "Salvar Configuração"}
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log("Dados do formulário SMTP:", smtpFormData);
                      console.log("Configuração atual:", smtpConfig);
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Debug
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter Actions */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                Ações da Newsletter
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    Enviar Newsletter
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Selecione um post para enviar como newsletter para todos os inscritos.
                  </p>
                  
                  <select 
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Selecione um post...</option>
                    {posts?.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={handleSendNewsletter}
                    disabled={sendNewsletterMutation.isPending || !selectedPostId}
                    className="px-6 py-3 bg-secondary-600 hover:bg-secondary-700 disabled:bg-secondary-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {sendNewsletterMutation.isPending ? "Enviando..." : "Enviar Newsletter"}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                    Gerar HTML
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Gere o HTML da newsletter para um post específico.
                  </p>
                  
                  <select 
                    value={selectedPostId}
                    onChange={(e) => setSelectedPostId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Selecione um post...</option>
                    {posts?.map((post) => (
                      <option key={post.id} value={post.id}>
                        {post.title}
                      </option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={handleGenerateHTML}
                    disabled={!selectedPostId}
                    className="px-6 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-accent-400 text-white rounded-lg font-medium transition-colors"
                  >
                    Gerar HTML
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
