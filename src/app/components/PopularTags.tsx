"use client";

import { trpc } from "~/trpc/react";
import Link from "next/link";
import { Tag, TrendingUp } from "lucide-react";

interface PopularTagsProps {
  limit?: number;
  className?: string;
}

export default function PopularTags({ limit = 12, className = "" }: PopularTagsProps) {
  const { data: popularTags, isLoading, error } = trpc.tag.getPopular.useQuery({ limit });

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !popularTags || popularTags.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Tags Populares
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="group inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: `${tag.color || "#3B82F6"}15`,
              color: tag.color || "#3B82F6",
            }}
          >
            <Tag className="w-4 h-4" />
            <span>{tag.name}</span>
            <span className="text-xs opacity-70">({tag.viewCount})</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 