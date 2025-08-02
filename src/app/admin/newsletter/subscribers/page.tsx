"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import { 
  Users, 
  Mail, 
  Search, 
  Download, 
  Trash2, 
  RefreshCw,
  Eye,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function SubscribersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const { data: subscribersData, isLoading, refetch } = trpc.newsletter.getSubscribers.useQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm || undefined,
  });

  const { data: stats } = trpc.newsletter.getStats.useQuery();

  const handleSearch = () => {
    setCurrentPage(1);
    void refetch();
  };

  const handleExport = () => {
    // Implementar exportação de dados
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Nome,Fonte,Status,Data de Inscrição\n"
      + subscribersData?.subscribers.map(sub => 
          `${sub.email},${sub.name ?? ""},${sub.source ?? ""},${sub.isActive ? "Ativo" : "Inativo"},${new Date(sub.subscribedAt).toLocaleDateString('pt-BR')}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/admin"
                className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao Admin</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Inscritos na Newsletter
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Gerencie os inscritos e acompanhe as métricas da newsletter
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={() => void refetch()}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {stats?.totalSubscribers ?? 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Total de Inscritos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Todos os tempos
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {stats?.activeSubscribers ?? 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Inscritos Ativos</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recebendo emails
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {stats?.openRate ? `${stats.openRate.toFixed(1)}%` : '0%'}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Taxa de Abertura</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Média geral
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {stats?.last30Days?.newSubscribers ?? 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Novos (30 dias)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Último mês
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              Lista de Inscritos
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {subscribersData?.total ?? 0} inscritos encontrados
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-slate-600 dark:text-slate-400">Carregando...</span>
            </div>
          ) : subscribersData?.subscribers && subscribersData.subscribers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Fonte</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Inscrito em</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribersData.subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {subscriber.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {subscriber.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {subscriber.source ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subscriber.isActive
                              ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                          }`}>
                            {subscriber.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {formatDate(subscriber.subscribedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!subscriber.isActive && (
                              <button
                                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subscribersData.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Página {subscribersData.currentPage} de {subscribersData.pages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(subscribersData.pages, prev + 1))}
                      disabled={currentPage === subscribersData.pages}
                      className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Nenhum inscrito encontrado
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Ainda não há inscritos na newsletter"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 