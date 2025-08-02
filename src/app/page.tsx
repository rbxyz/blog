"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: paginatedData,
    error,
    isLoading,
  } = trpc.post.getPaginated.useQuery({
    page: currentPage,
    limit: 8,
  });

  const allPosts = paginatedData?.posts ?? [];
  const hasMore = paginatedData?.hasMore ?? false;
  const totalPosts = paginatedData?.total ?? 0;

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando posts incríveis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center border border-red-200 dark:border-red-800">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">Ops! Erro ao carregar os posts</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Tech & Marketing & Business
        </h1>
        
        <p className="text-lg text-center mb-12">
          Explore artigos sobre tecnologias - dev. & IAs, marketing & mundo e business & startups.
        </p>
        
        <div className="mb-8 text-center">
          <span className="text-sm text-slate-600">
            {totalPosts} artigos disponíveis
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.slug}`} className="group">
              <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 group-hover:shadow-glow group-hover:scale-105">
                <h2 className="font-bold text-lg mb-3 group-hover:text-primary-600 transition-colors">{post.title}</h2>
                <p className="text-slate-600 text-sm mb-4">
                  {post.content?.substring(0, 150)}...
                </p>
                <div className="text-xs text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {isLoading ? 'Carregando...' : 'Veja mais posts'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 