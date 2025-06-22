"use client";

import type { Post } from "@prisma/client";
import { trpc } from "~/trpc/react";
import SearchBy from "./components/SearchBy";
import Link from "next/link";
import { Calendar, Eye, ArrowRight, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { createExcerpt } from "~/lib/utils";

export default function HomePage() {
  const {
    data: recentPosts,
    error,
    isLoading,
  } = trpc?.post?.recent?.useQuery() ?? {
    data: [],
    error: null,
    isLoading: false,
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
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary-400/20 to-secondary-400/20 blur-xl animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-accent-400/20 to-primary-400/20 blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="text-center relative z-10">
            <div className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-2 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Bem-vindo ao futuro do desenvolvimento
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="gradient-text">Blog de Tecnologia</span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">& Inovação</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Explore artigos sobre desenvolvimento web, tecnologias emergentes, 
              boas práticas e insights do mundo da programação.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link 
                href="#posts" 
                className="group relative inline-flex items-center space-x-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-glow"></div>
                <span className="relative z-10 text-white">Explorar Posts</span>
                <ArrowRight className="relative z-10 w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
              </Link>
              
              <div className="glass-card rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    <span className="text-slate-600 dark:text-slate-400">{recentPosts?.length ?? 0} artigos</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-secondary-500" />
                    <span className="text-slate-600 dark:text-slate-400">Sempre atualizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <SearchBy />
        </div>
      </section>

      {/* Posts Section */}
      <section id="posts" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Últimas Publicações</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Descubra os artigos mais recentes sobre tecnologia, desenvolvimento e inovação
            </p>
          </div>

          {recentPosts && recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentPosts.map((post: Post, index) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="group block animate-fade-in-up hover-lift"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <article className="glass-card rounded-2xl overflow-hidden h-full transition-all duration-300 group-hover:shadow-glow border border-slate-200/20 dark:border-slate-700/20">
                    {/* Image */}
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

                    {/* Content */}
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="font-bold text-lg mb-3 line-clamp-2 text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                        {createExcerpt(post.content ?? '', 150)}
                      </p>
                      
                      {/* Meta info */}
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

                      {/* Read more indicator */}
                      <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span>Ler mais</span>
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Nenhum post encontrado
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Os primeiros artigos incríveis estão chegando em breve!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
