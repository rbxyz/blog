"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Plus, Edit, Trash2, Eye, MessageSquare, Users, FileText, TrendingUp, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const { data: posts } = api.post.getAll.useQuery();
  const { data: comments } = api.comment.getAll.useQuery();

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
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                      }`}>
                        {post.published ? "Publicado" : "Rascunho"}
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
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            post.published 
                              ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                          }`}>
                            {post.published ? "Publicado" : "Rascunho"}
                          </span>
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
      </div>
    </div>
  );
}
