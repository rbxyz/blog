'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, ArrowLeft, Check } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Validação de senha em tempo real
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação local
    if (!isPasswordValid) {
      setError('Por favor, atenda a todos os requisitos de senha.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json() as { user?: any; error?: string };

      if (response.ok) {
        // Registro bem-sucedido
        router.push('/');
        router.refresh();
      } else {
        setError(data.error ?? 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="group inline-flex items-center space-x-2 glass-card rounded-xl px-4 py-2 mb-8 hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors group-hover:-translate-x-1" />
            <span className="text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Voltar ao blog
            </span>
          </Link>

          <h2 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Criar Conta</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Junte-se à nossa comunidade de desenvolvedores
          </p>
        </div>

        {/* Register Form */}
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nome (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="glass-card w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/20 dark:border-slate-700/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-card w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/20 dark:border-slate-700/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-card w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200/20 dark:border-slate-700/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 glass-card rounded-xl">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Requisitos da senha:
                  </p>
                  <div className="space-y-1">
                    {[
                      { key: 'minLength', text: 'Pelo menos 8 caracteres' },
                      { key: 'hasUpperCase', text: 'Uma letra maiúscula' },
                      { key: 'hasLowerCase', text: 'Uma letra minúscula' },
                      { key: 'hasNumber', text: 'Um número' },
                    ].map(({ key, text }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Check 
                          className={`w-3 h-3 ${
                            passwordValidation[key as keyof typeof passwordValidation] 
                              ? 'text-green-500' 
                              : 'text-slate-400'
                          }`} 
                        />
                        <span 
                          className={`text-xs ${
                            passwordValidation[key as keyof typeof passwordValidation]
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="glass-card w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200/20 dark:border-slate-700/20 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-slate-700 dark:text-slate-300 placeholder-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  <Check 
                    className={`w-3 h-3 ${
                      passwordValidation.passwordsMatch 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`} 
                  />
                  <span 
                    className={`text-xs ${
                      passwordValidation.passwordsMatch
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {passwordValidation.passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card rounded-xl p-4 border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading ?? !isPasswordValid}
              className="group relative w-full inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-glow transition-all duration-300"></div>
              <span className="relative z-10 text-white flex items-center space-x-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Criar Conta</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Já tem uma conta?{' '}
              <Link
                href="/auth/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 