"use client";

import type React from "react";
import { useState } from "react";
import { trpc } from "~/trpc/react";
import Link from "next/link";
import Navbar from "../components/Navbar";

type PostForm = {
  title: string;
  content: string;
  name: string;
  imageUrl?: string;
};

type PostUpdate = PostForm & { id: string };

export default function AdminPosts() {
  const [editingPost, setEditingPost] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState<PostForm>({
    title: "",
    content: "",
    name: "",
  });
  const [image, setImage] = useState<File | null>(null);

  const categories = [
    { id: "novidades", name: "Novidades" },
    { id: "novos-projetos", name: "Novos Projetos" },
    { id: "blog", name: "Blog" },
  ];

  const { data: posts, refetch } = trpc.post.all.useQuery();
  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: () => refetch(),
  });
  const updatePostMutation = trpc.post.update.useMutation({
    onSuccess: () => refetch(),
  });
  const deletePostMutation = trpc.post.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

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
      await updatePostMutation.mutateAsync({
        id: editingPost.id,
        ...form,
        imageUrl,
      } as PostUpdate);
      setEditingPost(null);
    } else {
      await createPostMutation.mutateAsync({ ...form, imageUrl });
    }

    setForm({ title: "", content: "", name: "" });
    setImage(null);
  };

  const handleEdit = (post: any) => {
    setEditingPost({ id: post.id });
    setForm({
      title: post.title,
      content: post.content,
      name: post.name,
      imageUrl: post.imageUrl || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await deletePostMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Gerenciar Posts</h1>

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
                    src={post.imageUrl || "/placeholder.svg"}
                    alt={post.title}
                    className="h-24 w-24 rounded object-cover"
                  />
                )}
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p className="text-sm text-gray-600">Por {post.name}</p>
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
