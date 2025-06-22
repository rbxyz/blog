"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  slug: string;
  title: string;
}

export default function ShareButton({ slug, title }: ShareButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/post/${slug}`;
    
    // Verificar se o navegador suporta Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        return;
      } catch (error) {
        // Se o usuário cancelar ou houver erro, continua para clipboard
      }
    }
    
    // Fallback: copiar para clipboard
    try {
      await navigator.clipboard.writeText(url);
      
      // Feedback visual
      const button = document.activeElement as HTMLButtonElement;
      const span = button.querySelector('span');
      if (span) {
        const originalText = span.textContent;
        span.textContent = 'Copiado!';
        span.classList.add('text-green-600');
        setTimeout(() => {
          span.textContent = originalText;
          span.classList.remove('text-green-600');
        }, 2000);
      }
    } catch (error) {
      // Fallback mais antigo para navegadores sem clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Feedback visual
      const button = document.activeElement as HTMLButtonElement;
      const span = button.querySelector('span');
      if (span) {
        const originalText = span.textContent;
        span.textContent = 'Copiado!';
        span.classList.add('text-green-600');
        setTimeout(() => {
          span.textContent = originalText;
          span.classList.remove('text-green-600');
        }, 2000);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center space-x-2 glass-card rounded-lg px-3 py-1 hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      <Share2 className="w-4 h-4" />
      <span>Compartilhar</span>
    </button>
  );
} 