"use client";

import { useState, useEffect } from "react";
import { trpc } from "~/trpc/react";
import { Tag, X, Plus } from "lucide-react";

interface TagData {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  className?: string;
}

export default function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  className = "" 
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: allTags } = trpc.tag.getAll.useQuery();
  const { data: searchResults } = trpc.tag.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const availableTags = searchQuery.length > 0 ? searchResults : allTags || [];
  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    onTagsChange(newSelectedTags);
  };

  const handleRemoveTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(id => id !== tagId);
    onTagsChange(newSelectedTags);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Tags
      </label>
      
      {/* Tags selecionadas */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors"
              style={{
                backgroundColor: `${tag.color || "#3B82F6"}20`,
                color: tag.color || "#3B82F6",
              }}
            >
              <Tag className="w-3 h-3" />
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Campo de busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
        />
        
        {/* Dropdown de resultados */}
        {isOpen && availableTags.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  handleTagToggle(tag.id);
                  setSearchQuery("");
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 ${
                  selectedTags.includes(tag.id) 
                    ? "bg-primary-50 dark:bg-primary-900/20" 
                    : ""
                }`}
              >
                <Tag 
                  className="w-4 h-4" 
                  style={{ color: tag.color || "#3B82F6" }}
                />
                <span className="flex-1">{tag.name}</span>
                {selectedTags.includes(tag.id) && (
                  <span className="text-primary-600 dark:text-primary-400">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dica */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Digite para buscar tags existentes ou selecione das opções disponíveis
      </p>
    </div>
  );
} 