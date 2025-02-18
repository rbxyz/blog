"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { mutateAsync } = trpc.post.create.useMutation({
    onSuccess: (data) => {
      console.log("Novo post criado com sucesso:", data);
      router.push("/"); // Redireciona para a página principal após sucesso
    },
    onError: (err) => {
      setError(err.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !name) {
      setError("Todos os campos são obrigatórios!");
      return;
    }

    setIsLoading(true);
    try {
      await mutateAsync({ title, content, name });
    } catch (err) {
      setError("Erro ao criar o post. Tente novamente.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-center text-3xl font-semibold text-gray-800">
        Painel de Administração
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-lg">
            Título do Post
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Digite o título do post"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-lg">
            Conteúdo do Post
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Digite o conteúdo do post"
            rows={6}
            required
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-lg">
            Nome do Autor
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Digite o nome do autor"
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="text-center">
          <button
            type="submit"
            className={`rounded-lg bg-blue-600 px-4 py-2 text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
