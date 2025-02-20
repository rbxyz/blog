"use client";

import { useState } from "react";
import { trpc } from "~/trpc/react";
import Link from "next/link";
import Navbar from "../components/Navbar";

// Definição de tipos para garantir segurança
type PostForm = {
  title: string;
  content: string;
  name: string;
  imageUrl?: string;
  categoryId?: string;
};

type PostUpdate = PostForm & { id: string };

export default function AdminPosts() {
  const [editingPost, setEditingPost] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState<PostForm>({
    title: "",
    content: "",
    name: "",
    categoryId: "",
  });
  const [image, setImage] = useState<File | null>(null);

  // Categorias fixas
  const categories = [
    { id: "novidades", name: "Novidades" },
    { id: "novos-projetos", name: "Novos Projetos" },
    { id: "blog", name: "Blog" },
  ];

  // Fetch posts
  const { data: posts, refetch } = trpc.post.all.useQuery();
  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const updatePost = trpc.post.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const deletePost = trpc.post.create.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = form.imageUrl || "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      imageUrl = data.imageUrl;
    }

    if (editingPost) {
      await updatePost.mutateAsync({
        id: editingPost.id,
        ...form,
        imageUrl,
      } as PostUpdate);
      setEditingPost(null);
    } else {
      await createPost.mutateAsync({ ...form, imageUrl });
    }

    setForm({ title: "", content: "", name: "", categoryId: "" });
    setImage(null);
  };

  // Handle edit
  const handleEdit = (post: any) => {
    setEditingPost({ id: post.id });
    setForm({
      title: post.title,
      content: post.content,
      name: post.name,
      categoryId: post.categoryId || "",
      imageUrl: post.imageUrl || "",
    });
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      const deletePost = trpc.post.delete.useMutation({
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Gerenciar Posts</h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título"
            className="w-full rounded border p-2"
            required
          />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Conteúdo"
            className="w-full rounded border p-2"
            required
          />
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Autor"
            className="w-full rounded border p-2"
            required
          />

          {/* Seleção de categoria */}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Upload de imagem */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded border p-2"
          />
          {image && <p>Imagem selecionada: {image.name}</p>}

          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            {editingPost ? "Atualizar" : "Criar"} Post
          </button>
        </form>

        {/* Lista de posts */}
        <div className="mt-6">
          <h2 className="mb-2 text-xl font-semibold">Posts Criados</h2>
          {posts?.map((post) => (
            <div
              key={post.id}
              className="mb-2 flex justify-between rounded border p-4"
            >
              <div>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="h-24 w-24 rounded object-cover"
                  />
                )}
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="text-sm text-gray-600">Por {post.name}</p>
                <p className="text-sm text-gray-600">
                  Categoria:{" "}
                  {categories.find((c) => c.id === post.categoryId)?.name ||
                    "Sem categoria"}
                </p>
                <Link href={`/post/${post.slug}`} className="text-blue-600">
                  Ver Post
                </Link>
              </div>
              <div>
                <button
                  onClick={() => handleEdit(post)}
                  className="mr-2 text-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
