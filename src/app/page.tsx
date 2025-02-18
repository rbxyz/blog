"use client";

import { trpc } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data, error, isLoading } = trpc.post.all.useQuery();
  const router = useRouter();

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar posts: {error.message}</p>;

  // Verifica se data é um array válido
  if (!Array.isArray(data)) {
    return (
      <p className="text-center text-xl text-yellow-500">Dados inválidos</p>
    );
  }

  // Função para limitar o texto a 200 caracteres
  const truncateText = (text: string) => {
    return text.length > 200 ? text.slice(0, 200) + "..." : text;
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Navbar com Botões */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ir para o Painel de Administração
          </button>
        </div>
        <div>
          <button
            onClick={() => router.push("/login")}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Login
          </button>
        </div>
      </div>

      {/* Lista de Posts */}
      <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">
        Lista de Posts
      </h1>
      <ul className="space-y-4">
        {data.map((post) => (
          <li
            key={post.id}
            className="mb-4 cursor-pointer rounded-md border-b border-gray-300 p-4 hover:bg-gray-100"
            onClick={() =>
              router.push(
                `/post/${post.title.toLowerCase().replace(/\s+/g, "-")}`,
              )
            } // Usando o título como parte do link
          >
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p className="text-gray-600">
              {truncateText(post.content ?? "Sem descrição")}
            </p>
            <span className="mt-4 block text-sm text-gray-400">
              Autor: {post.name ?? "Autor desconhecido"}
            </span>
            <span className="block text-sm text-gray-400">
              Data: {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
