"use client";

import { trpc } from "~/trpc/react";
import { useRouter } from "next/navigation";
import SearchBy from "./components/SearchBy";
import Navbar from "./components/Navbar";
import Link from "next/link";
import { Category, Post } from "@prisma/client";

export default function HomePage() {
  const router = useRouter();

  const { data: recentPosts } = trpc?.post?.recent?.useQuery() ?? { data: [] };
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

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">
          Lista de Posts
        </h1>

        <SearchBy />

        {/* Seção de Categorias */}
        <div className="mb-4">
          <h2 className="text-xl font-bold">Categorias</h2>
          {categories.length > 0 ? (
            <ul className="flex gap-2">
              {categories.map(
                (
                  cat: Category, // ✅ Define explicitamente o tipo
                ) => (
                  <li key={cat.id}>
                    <Link
                      href={`/categoria/${cat.id}`}
                      className="block rounded bg-gray-200 px-3 py-1 text-center hover:bg-gray-300"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p>Nenhuma categoria encontrada</p>
          )}
        </div>

        {/* Seção de Notícias em 3 colunas */}
        <div className="mx-auto max-w-7xl p-4">
          <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">
            Notícias
          </h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Coluna 1 - Notícias Recentes */}
            <div>
              <h2 className="mb-4 text-xl font-bold">Recentes</h2>
              {recentPosts?.map((post: Post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="mb-2 block rounded border p-2 hover:bg-gray-100"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="mb-2 h-48 w-full rounded-md object-cover"
                    />
                  )}
                  <h3 className="font-semibold text-blue-600 hover:underline">
                    {post.title}
                  </h3>
                  <p>{post.content?.slice(0, 100)}...</p>
                </Link>
              ))}
            </div>

            {/* Coluna 2 - Notícias Mais Lidas */}
            <div>
              <h2 className="mb-4 text-xl font-bold">Mais Lidas</h2>
              {mostReadPosts?.map((post: Post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="mb-2 block rounded border p-2 hover:bg-gray-100"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="mb-2 h-48 w-full rounded-md object-cover"
                    />
                  )}
                  <h3 className="font-semibold text-blue-600 hover:underline">
                    {post.title}
                  </h3>
                  <p>{post.content?.slice(0, 100)}...</p>
                </Link>
              ))}
            </div>

            {/* Coluna 3 - Notícias em Alta */}
            <div>
              <h2 className="mb-4 text-xl font-bold">Em Alta</h2>
              {trendingPosts?.map((post: Post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="mb-2 block rounded border p-2 hover:bg-gray-100"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="mb-2 h-48 w-full rounded-md object-cover"
                    />
                  )}
                  <h3 className="font-semibold text-blue-600 hover:underline">
                    {post.title}
                  </h3>
                  <p>{post.content?.slice(0, 100)}...</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
