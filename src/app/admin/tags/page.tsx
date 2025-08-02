"use client";

import { trpc } from "~/trpc/react";
import { useState } from "react";
import { useNotifications } from "~/app/components/NotificationModal";
import { Tag, Plus, Edit, Trash2, Eye, TrendingUp } from "lucide-react";

interface TagData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function TagsPage() {
  const { showNotification } = useNotifications();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  const { data: tags, refetch } = trpc.tag.getAll.useQuery();
  const { data: metrics } = trpc.tag.getMetrics.useQuery();
  const createTag = trpc.tag.create.useMutation();
  const updateTag = trpc.tag.update.useMutation();
  const deleteTag = trpc.tag.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        await updateTag.mutateAsync({
          id: editingTag.id,
          ...formData,
        });
        showNotification({
          type: "success",
          title: "Tag atualizada!",
          message: "A tag foi atualizada com sucesso.",
        });
        setEditingTag(null);
      } else {
        await createTag.mutateAsync(formData);
        showNotification({
          type: "success",
          title: "Tag criada!",
          message: "A nova tag foi criada com sucesso.",
        });
      }
      
      setFormData({ name: "", description: "", color: "#3B82F6" });
      setIsCreating(false);
      void refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao salvar a tag.";
      showNotification({
        type: "error",
        title: "Erro!",
        message: errorMessage,
      });
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tag?")) return;
    
    try {
      await deleteTag.mutateAsync({ id: tagId });
      showNotification({
        type: "success",
        title: "Tag deletada!",
        message: "A tag foi removida com sucesso.",
      });
      void refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro ao deletar a tag.";
      showNotification({
        type: "error",
        title: "Erro!",
        message: errorMessage,
      });
    }
  };

  const handleEdit = (tag: TagData) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description ?? "",
      color: tag.color ?? "#3B82F6",
    });
    setIsCreating(true);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Gerenciar Tags
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Crie e gerencie tags para organizar seus posts
          </p>
        </div>

        {/* Métricas */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total de Tags</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {metrics.totalTags}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Mais Visualizada</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {metrics.popularTags[0]?.name ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Mais Usada</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {metrics.tagsWithPostCount[0]?.name ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {editingTag ? "Editar Tag" : "Criar Nova Tag"}
            </h2>
            {!isCreating && !editingTag && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Tag
              </button>
            )}
          </div>

          {(isCreating || editingTag) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nome da Tag
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                    placeholder="Ex: JavaScript, Marketing, Business"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                  placeholder="Descrição da tag..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createTag.isPending || updateTag.isPending}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  {createTag.isPending || updateTag.isPending ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTag(null);
                    setFormData({ name: "", description: "", color: "#3B82F6" });
                  }}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de Tags */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">
            Tags Existentes
          </h2>

          {tags && tags.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags?.map((tag) => (
                <div
                  key={tag.id}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color ?? "#3B82F6" }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {tag.name}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          if (tag && typeof tag === 'object' && 'id' in tag) {
                            handleEdit(tag);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (tag && typeof tag === 'object' && 'id' in tag) {
                            void handleDelete(tag.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {tag.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {tag.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {tag.viewCount} views
                    </span>
                    <span>Slug: {tag.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Nenhuma tag encontrada
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Crie sua primeira tag para começar a organizar os posts!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 