"use client";

import { trpc } from "~/trpc/react";
import { useRouter } from "next/navigation";
import SearchBy from "./components/SearchBy";
import Navbar from "./components/Navbar";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Biblioteca de ícones

import { Post } from "@prisma/client";

export default function HomePage() {
  const router = useRouter();

  const { data: recentPosts } = trpc?.post?.recent?.useQuery() ?? { data: [] };
  /*
  const { data: mostReadPosts } = trpc?.post?.mostRead?.useQuery() ?? {
    data: [],
  };
  const { data: trendingPosts } = trpc?.post?.trending?.useQuery() ?? {
    data: [],
  };
  const {
    data: posts,
    error,
    isLoading,
  } = trpc?.post?.all?.useQuery() ?? { data: [] };
  const { data: categories = [] } = trpc.category.all.useQuery();

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar posts: {error.message}</p>;
  
  */

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">
          Lista de Posts
        </h1>

        <SearchBy />

        {/* Seção de Notícias */}
        <div className="mx-auto max-w-7xl p-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-gray-800">
              Últimas postagens
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentPosts?.map((post: Post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="block rounded border p-3 hover:bg-gray-100"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="mb-2 h-40 w-full rounded-md object-cover"
                  />
                )}
                <h3 className="font-semibold text-blue-600 hover:underline">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {post.content?.slice(0, 100)}...
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
