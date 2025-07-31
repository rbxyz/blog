'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function NewsletterSignup({ className = '', variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const subscribeMutation = api.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setEmail('');
        setName('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    },
    onError: (error) => {
      setMessage({
        type: 'error',
        text:
          (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string')
            ? error.message
            : 'Erro ao inscrever na newsletter'
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, insira seu e-mail' });
      return;
    }

    void subscribeMutation.mutate({
      email,
      name: name || undefined,
      source: 'website_form',
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`glass-card rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Receba novos artigos
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={subscribeMutation.isPending}
            onInvalid={(error) => setMessage({ type: 'error', text: (error as unknown as Error).message || 'E-mail inválido' })}
          />

          {message && (
            <div className={`flex items-center space-x-2 text-sm ${
              message.type === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            onClick={async (e) => {
              try {
                await handleSubmit(e);
              } catch (error) {
                setMessage({ type: 'error', text: (error as Error).message || 'Erro ao inscrever' });
              }
            }}
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inscrevendo...</span>
              </>
            ) : (
              <span>Inscrever</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-2xl p-8 ${className}`}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Fique por dentro das novidades!
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Receba novos artigos, dicas de tecnologia e atualizações diretamente no seu e-mail.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nome (opcional)
          </label>
          <input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={subscribeMutation.isPending}
            onInvalid={(error) => setMessage({ type: 'error', text: (error as unknown as Error).message || 'Nome inválido' })}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            E-mail *
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={subscribeMutation.isPending}
            required
            onInvalid={(error) => setMessage({ type: 'error', text: (error as unknown as Error).message || 'E-mail inválido' })}
          />
        </div>

        {message && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={subscribeMutation.isPending}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {subscribeMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Inscrevendo...</span>
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              <span>Inscrever na Newsletter</span>
            </>
          )}
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Não enviamos spam. Você pode cancelar a inscrição a qualquer momento.
        </p>
      </form>
    </div>
  );
} 