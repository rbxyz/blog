"use client";

import { useState } from "react";
import { trpc } from "~/trpc/react";

export default function SearchPosts() {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = trpc.post.search.useQuery(
    { query },
    { enabled: !!query },
  );

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Buscar posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border p-2"
      />
      {isLoading && <p>Buscando...</p>}
      {results && (
        <ul className="mt-4 space-y-2">
          {results.map((post) => (
            <li key={post.id} className="rounded bg-gray-100 p-2">
              {post.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
