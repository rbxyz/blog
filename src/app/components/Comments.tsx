"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { MessageCircle, Send, Edit, Trash2, User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar?: string | null;
}

interface CommentsProps {
  postId: string;
  user?: User | null;
}

export default function Comments({ postId, user }: CommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Buscar comentários
  const { data: comments, refetch } = api.comment.getByPostId.useQuery({ postId });

  // Mutations
  const createMutation = api.comment.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      refetch();
    },
  });

  const updateMutation = api.comment.update.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      refetch();
    },
  });

  const deleteMutation = api.comment.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() ?? !user) return;

    createMutation.mutate({
      content: newComment.trim(),
      postId,
    });
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = (commentId: string) => {
    if (!editContent.trim()) return;

    updateMutation.mutate({
      id: commentId,
      content: editContent.trim(),
    });
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Tem certeza que deseja deletar este comentário?")) {
      deleteMutation.mutate({ id: commentId });
    }
  };

  const canEditDelete = (comment: Comment) => {
    if (!user) return false;
    return comment.author.id === user.id ?? user.role === "ADMIN";
  };

  return (
    <div className="mt-12 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-2xl font-bold gradient-text">
          Comentários ({comments?.length ?? 0})
        </h3>
      </div>

      {/* Formulário de novo comentário */}
      {user ? (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name ?? user.email} className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {user.name ?? user.email.split('@')[0]}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comentando como {user.role}
              </p>
            </div>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="w-full min-h-[100px] p-4 rounded-xl glass border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200 resize-none"
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {newComment.length}/500 caracteres
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() ?? createMutation.isPending}
              className="group relative px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{createMutation.isPending ? "Enviando..." : "Comentar"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Você precisa estar logado para comentar
          </p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium transition-all duration-300 hover:scale-105"
          >
            Fazer Login
          </a>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="glass-card rounded-xl p-6 space-y-4">
            {/* Header do comentário */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                  {comment.author.avatar ? (
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name ?? comment.author.email} 
                      className="w-10 h-10 rounded-full" 
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {comment.author.name ?? comment.author.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Ações do comentário */}
              {canEditDelete(comment) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(comment)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Conteúdo do comentário */}
            {editingId === comment.id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-lg glass border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all duration-200 resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdate(comment.id)}
                    disabled={!editContent.trim() ?? updateMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateMutation.isPending ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 