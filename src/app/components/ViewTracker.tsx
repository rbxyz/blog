'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const recordView = async () => {
      try {
        const response = await fetch(`/api/posts/${slug}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json() as { success: boolean };
          console.log('Visualização registrada:', data);
        }
      } catch (error) {
        console.error('Erro ao registrar visualização:', error);
      }
    };

    // Registrar visualização após um pequeno delay para garantir que a página carregou
    const timer = setTimeout(() => {
      void recordView();
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug]);

  // Este componente não renderiza nada visualmente
  return null;
} 