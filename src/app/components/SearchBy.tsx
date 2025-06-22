"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "~/trpc/react";
import Link from "next/link";
import { Search, Calendar, Eye, X, Loader2, ArrowRight, FileText } from "lucide-react";
import { createExcerpt } from "~/lib/utils";
import type { Post } from "@prisma/client";

export default function SearchBy() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isLoading } = trpc.post.search.useQuery(
    { query },
    { enabled: !!query && query.length >= 3 }
  );

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handlePostClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/20 dark:border-slate-700/20 focus-within:border-primary-500/50 focus-within:search-glow transition-all duration-300">
          <div className="flex items-center px-6 py-4">
            <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar posts por título ou conteúdo..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length > 0 && setIsOpen(true)}
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none text-lg"
            />

            {/* Keyboard shortcut hint */}
            {!query && (
              <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
            )}

            {/* Clear button */}
            {query && (
              <button
                onClick={clearSearch}
                className="ml-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="glass-card rounded-2xl border border-slate-200/20 dark:border-slate-700/20 shadow-2xl max-h-96 overflow-hidden search-results-enter">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Buscando...</span>
                </div>
              )}

              {/* No Query State */}
              {query.length > 0 && query.length < 3 && !isLoading && (
                <div className="p-6 text-center">
                  <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Digite pelo menos 3 caracteres para buscar
                  </p>
                </div>
              )}

              {/* No Results State */}
              {query.length >= 3 && !isLoading && (!results || results.length === 0) && (
                <div className="p-6 text-center">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Nenhum post encontrado
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">
                    Tente outras palavras-chave
                  </p>
                </div>
              )}

              {/* Results */}
              {results && results.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((post: Post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      onClick={handlePostClick}
                      className="group block hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200/20 dark:border-slate-700/20 last:border-0"
                    >
                      <div className="p-4 flex items-start space-x-4">
                        {/* Post Image or Icon */}
                        <div className="flex-shrink-0">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary-500" />
                            </div>
                          )}
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-2">
                            {createExcerpt(post.content ?? '', 100)}
                          </p>

                          <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
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

                        {/* Arrow Icon */}
                        <div className="flex-shrink-0">
                          <ArrowRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* Show more results hint */}
                  {results.length >= 5 && (
                    <div className="p-4 text-center border-t border-slate-200/20 dark:border-slate-700/20">
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {results.length} resultados encontrados
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
