"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import Link from "next/link";
import { Calendar, Eye, ArrowLeft, BookOpen, Loader2, Tag } from "lucide-react";
import { createExcerpt } from "~/lib/utils";
import TagDisplay from "~/app/components/TagDisplay";

interface TagPageProps {
  params: {
    slug: string;
  };
}

export default function TagPage({ params }: TagPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const {
    data: tagData,
    error,
    isLoading,
  } = trpc.tag.getPostsByTag.useQuery({
    tagSlug: params.slug,
    page: currentPage,
    limit: 8,
  });

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando posts da tag...</p>
        </div>
      </div>
    );
  }

  if (error || !tagData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center border border-red-200 dark:border-red-800">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">Tag não encontrada</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            A tag que você está procurando não existe ou foi removida.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const { tag, posts, total, hasMore } = tagData;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: tag.color || "#3B82F6" }}
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tag
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span 
                className="gradient-text"
                style={{ 
                  background: `linear-gradient(135deg, ${tag.color || "#3B82F6"}, ${tag.color || "#3B82F6"}80)` 
                }}
              >
                {tag.name}
              </span>
            </h1>
            
            {tag.description && (
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
                {tag.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{total} posts</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{tag.viewCount} visualizações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} className="group">
                <article className="glass-card rounded-2xl overflow-hidden h-full transition-all duration-300 group-hover:shadow-glow border border-slate-200/20 dark:border-slate-700/20">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    <h3 className="font-bold text-lg mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-grow">
                      {createExcerpt(post.content ?? '', 150)}
                    </p>
                    
                    {post.tags && post.tags.length > 0 && (
                      <TagDisplay 
                        tags={post.tags.map(pt => pt.tag)} 
                        className="mb-4" 
                        clickable={true}
                      />
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/20 dark:border-slate-700/20">
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
            <div className="text-center mt-12">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="group relative inline-flex items-center space-x-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-glow"></div>
                <span className="relative z-10 text-white">
                  {isLoading ? 'Carregando...' : 'Veja mais posts'}
                </span>
                {isLoading ? (
                  <Loader2 className="relative z-10 w-5 h-5 text-white animate-spin" />
                ) : (
                  <Tag className="relative z-10 w-5 h-5 text-white" />
                )}
              </button>
            </div>
          )}
        ) : (
          <div className="text-center py-16">
            <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
              <Tag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-6">
                Ainda não há posts com a tag "{tag.name}".
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Ver todos os posts
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 