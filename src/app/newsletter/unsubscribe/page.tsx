'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '~/trpc/react';
import { Mail, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const unsubscribeMutation = api.newsletter.unsubscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message || 'Erro ao cancelar inscrição' });
      setIsProcessing(false);
    },
  });

  const handleUnsubscribe = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email não fornecido' });
      return;
    }

    setIsProcessing(true);
    unsubscribeMutation.mutate({ email });
  };

  useEffect(() => {
    if (email) {
      void handleUnsubscribe();
    }
  }, [email, handleUnsubscribe]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Cancelar Inscrição
          </h1>

          {!email ? (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Para cancelar sua inscrição na newsletter, clique no link que foi enviado para o seu email.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao blog</span>
              </Link>
            </div>
          ) : isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400">
                Processando cancelamento...
              </p>
            </div>
          ) : message ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-center space-x-2 ${
                message.type === 'success' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {message.type === 'success' ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
              
              <Link 
                href="/"
                className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao blog</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Cancelando inscrição para: <strong>{email}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 