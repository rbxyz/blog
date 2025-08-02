"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Eye, ArrowRight, BookOpen, Loader2 } from "lucide-react";

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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Tech & Marketing</span>
            <br />
            <span className="text-slate-800 dark:text-slate-200">& Business</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Explore artigos sobre tecnologias - dev. & IAs, marketing & mundo e business & startups.
          </p>
          
          <div className="text-sm text-slate-500">
            {totalPosts} artigos disponíveis
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {allPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.slug}`} className="group">
              <article className="glass-card rounded-2xl overflow-hidden h-full transition-all duration-300 group-hover:shadow-glow">
                <div className="relative overflow-hidden">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary-500/50" />
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">
                    {post.content?.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200/20">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {post.viewCount !== undefined && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.viewCount} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Carregando...' : 'Veja mais posts'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 