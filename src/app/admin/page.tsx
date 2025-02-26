"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { trpc } from "~/trpc/react";
import { useAuth } from "@clerk/nextjs";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Post {
  id: string;
  title: string;
  content: string;
  name: string;
  imageUrl?: string | null;
  slug: string;
}

interface PostForm {
  title: string;
  content: string;
  name: string;
  imageUrl?: string;
}

export default function AdminPosts() {
  const { isLoaded } = useAuth();

  const [editingPost, setEditingPost] = useState<{ id: string } | null>(null);
  const [form, setForm] = useState<PostForm>({
    title: "",
    content: "",
    name: "Ruan | D3v",
  });
  const [image, setImage] = useState<File | null>(null);

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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] ?? null); // ✅ Uso do optional chaining
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = form.imageUrl ?? "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { imageUrl: string };
      imageUrl = data.imageUrl;
    }

    if (editingPost) {
      await updatePostMutation.mutateAsync({
        id: editingPost.id,
        ...form,
        imageUrl,
      });
      setEditingPost(null);
    } else {
      await createPostMutation.mutateAsync({ ...form, imageUrl });
    }

    setForm({ title: "", content: "", name: "" });
    setImage(null);
  };

  const handleEdit = (post: Post) => {
    setEditingPost({ id: post.id });
    setForm({
      title: post.title,
      content: post.content,
      name: post.name,
      imageUrl: post.imageUrl ?? "",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      await deletePostMutation.mutateAsync(id);
    }
  };

  const handleContentChange = (value?: string) => {
    setForm((prevForm) => ({ ...prevForm, content: value ?? "" }));
  };

  if (!isLoaded)
    return <p className="text-center text-gray-500">Carregando...</p>;

  return (
    <div>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Gerenciar Posts</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Título"
            className="w-full rounded border bg-white p-2 text-black dark:bg-gray-900 dark:text-white"
            required
          />

          <MDEditor
            value={form.content}
            onChange={handleContentChange}
            height={600}
            previewOptions={{ remarkPlugins: [remarkGfm, remarkBreaks] }}
            className="bg-white text-black dark:bg-gray-900 dark:text-white"
          />

          {/* 🔹 Input para Upload de Imagem */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded border p-2"
          />

          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            {editingPost ? "Atualizar" : "Criar"} Post
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-center text-xl font-semibold">
          Posts Criados
        </h2>
        {posts?.map((post: Post) => (
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
  );
}
