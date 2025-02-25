"use client";

import type { Post } from "@prisma/client";
import { trpc } from "~/trpc/react";
import SearchBy from "./components/SearchBy";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: recentPosts } = trpc?.post?.recent?.useQuery() ?? { data: [] };

  return (
    <div>
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
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={300}
                    height={200}
                    className="mb-2 h-40 w-full rounded-md object-cover"
                    priority
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
