"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Mail, 
  Eye, 
  MessageSquare, 
  Play, 
  RefreshCw
} from "lucide-react";

export default function MetricsPage() {
  const [dateRange, setDateRange] = useState("30"); // 7, 30, 90 dias
  const [, setRefreshKey] = useState(0);

  // Buscar métricas
  const { data: postMetrics, isLoading: loadingPosts } = trpc.post.getMetrics.useQuery(
    { days: parseInt(dateRange) },
    { refetchInterval: 30000 } // Atualizar a cada 30 segundos
  );

  const { data: newsletterMetrics, isLoading: loadingNewsletter } = trpc.newsletter.getStats.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  const { data: commentMetrics, isLoading: loadingComments } = trpc.comment.getMetrics.useQuery(
    { days: parseInt(dateRange) },
    { refetchInterval: 30000 }
  );

  const { data: audioMetrics, isLoading: loadingAudio } = trpc.post.getAudioMetrics.useQuery(
    { days: parseInt(dateRange) },
    { refetchInterval: 30000 }
  );

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString('pt-BR');
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Métricas do Blog
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                KPIs essenciais para o sucesso do seu blog
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Posts */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
                             <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                 {postMetrics?.totalPosts ?? 0}
               </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Total de Posts</h3>
                         <p className="text-sm text-slate-500 dark:text-slate-400">
               {postMetrics?.newPosts ?? 0} novos no período
             </p>
          </div>

          {/* Total de Visualizações */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
                             <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                 {formatNumber(postMetrics?.totalViews ?? 0)}
               </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Total de Visualizações</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatNumber(postMetrics?.newViews ?? 0)} no período
            </p>
          </div>

          {/* Inscritos na Newsletter */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {formatNumber(newsletterMetrics?.activeSubscribers ?? 0)}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Inscritos Ativos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatNumber(newsletterMetrics?.last30Days?.newSubscribers ?? 0)} novos
            </p>
          </div>

          {/* Total de Comentários */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {formatNumber(commentMetrics?.totalComments ?? 0)}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Total de Comentários</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatNumber(commentMetrics?.newComments ?? 0)} no período
            </p>
          </div>
        </div>

        {/* Seções de Métricas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Posts do Blog */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Posts do Blog</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Visualização por Post</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {postMetrics?.averageViewsPerPost ? formatNumber(postMetrics.averageViewsPerPost) : 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Tempo Médio na Página</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {postMetrics?.averageTimeOnPage ? formatTime(postMetrics.averageTimeOnPage) : '0min'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Rolagem</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {postMetrics?.averageScrollDepth ? formatPercentage(postMetrics.averageScrollDepth) : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Posts Mais Populares</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {postMetrics?.topPosts?.length ?? 0} posts
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Newsletter</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Abertura</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {newsletterMetrics?.openRate ? formatPercentage(newsletterMetrics.openRate) : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Cliques</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {newsletterMetrics?.clickRate ? formatPercentage(newsletterMetrics.clickRate) : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Emails Enviados</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatNumber(newsletterMetrics?.totalEmailsSent ?? 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Cancelamento</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {newsletterMetrics?.totalSubscribers && newsletterMetrics?.unsubscribedCount 
                    ? formatPercentage((newsletterMetrics.unsubscribedCount / newsletterMetrics.totalSubscribers) * 100)
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Áudios e Podcasts */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Áudios e Podcasts</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total de Reproduções</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatNumber(audioMetrics?.totalPlays ?? 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Conclusão</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {audioMetrics?.completionRate ? formatPercentage(audioMetrics.completionRate) : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Tempo Médio de Escuta</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {audioMetrics?.averageListenTime ? formatTime(audioMetrics.averageListenTime) : '0min'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Posts com Áudio</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {audioMetrics?.postsWithAudio ?? 0} posts
                </span>
              </div>
            </div>
          </div>

          {/* Comentários */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Comentários</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Comentários por Post</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {commentMetrics?.averageCommentsPerPost ? commentMetrics.averageCommentsPerPost.toFixed(1) : 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Resposta</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {commentMetrics?.responseRate ? formatPercentage(commentMetrics.responseRate) : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Sentimento Positivo</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {commentMetrics?.positiveSentiment ? formatPercentage(commentMetrics.positiveSentiment) : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Usuários Únicos</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatNumber(commentMetrics?.uniqueCommenters ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Tabelas */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Posts Mais Populares */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Posts Mais Populares</h3>
            <div className="space-y-3">
              {postMetrics?.topPosts?.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-1">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatNumber(post.viewCount ?? 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crescimento da Newsletter */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Crescimento da Newsletter</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Inscritos Ativos</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatNumber(newsletterMetrics?.activeSubscribers ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Novos (30 dias)</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +{formatNumber(newsletterMetrics?.last30Days?.newSubscribers ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Cancelamentos</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatNumber(newsletterMetrics?.unsubscribedCount ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Taxa de Retenção</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {newsletterMetrics?.activeSubscribers && newsletterMetrics?.totalSubscribers
                    ? formatPercentage((newsletterMetrics.activeSubscribers / newsletterMetrics.totalSubscribers) * 100)
                    : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading States */}
        {(loadingPosts || loadingNewsletter || loadingComments || loadingAudio) && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Carregando métricas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 