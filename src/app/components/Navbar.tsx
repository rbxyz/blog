"use client";

import Link from "next/link";
import { Sun, Moon, Menu, X, Code, ExternalLink, LogIn, LogOut, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
}

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação
  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json() as { user: User };
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setIsMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Link do admin (só para admins)
  const adminLink = user?.role === 'ADMIN' ? (
    <Link 
      href="/admin" 
      className="group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 glass-card hover:shadow-glow"
      onClick={() => setIsMenuOpen(false)}
    >
      <span className="relative z-10 text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
        Admin
      </span>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/10 group-hover:to-secondary-500/10 transition-all duration-300"></div>
    </Link>
  ) : null;

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Glass background with blur */}
      <div className="absolute inset-0 glass backdrop-blur-xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center space-x-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">
                Blog Tech & Marketing & Business
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                Powered By Allpines
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {adminLink}
            
            <Link 
              href="https://ruan.allpines.com.br/" 
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 glass-card hover:shadow-glow"
            >
              <span className="relative z-10 text-slate-700 dark:text-slate-300 group-hover:text-accent-600 dark:group-hover:text-accent-400 flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Portfólio</span>
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500/0 to-primary-500/0 group-hover:from-accent-500/10 group-hover:to-primary-500/10 transition-all duration-300"></div>
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="group relative w-12 h-12 rounded-xl glass-card hover:shadow-glow transition-all duration-300 hover:scale-110"
              aria-label="Alternar tema"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/10 group-hover:to-secondary-500/10 transition-all duration-300"></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500 transition-transform duration-300 group-hover:rotate-180" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600 transition-transform duration-300 group-hover:-rotate-12" />
                )}
              </div>
            </button>

            {/* Auth Section */}
            {loading ? (
              <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            ) : user ? (
              /* Authenticated User */
              <div className="flex items-center space-x-3">
                {/* User Avatar/Info */}
                <div className="relative group">
                  <div className="flex items-center space-x-2 glass-card rounded-xl px-3 py-2 hover:shadow-glow transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name ?? user.email} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {user.name ?? user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group relative w-12 h-12 rounded-xl glass-card hover:shadow-glow transition-all duration-300 hover:scale-110"
                  aria-label="Sair"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-red-600/0 group-hover:from-red-500/10 group-hover:to-red-600/10 transition-all duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <LogOut className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  </div>
                </button>
              </div>
            ) : (
              /* Not Authenticated */
              <Link href="/auth/login" className="group relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 opacity-70 blur transition-all duration-300 group-hover:opacity-100"></div>
                <div className="relative px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium transition-all duration-300 group-hover:scale-105 flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </div>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-12 h-12 rounded-xl glass-card hover:shadow-glow transition-all duration-300 hover:scale-110 flex items-center justify-center"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-6">
            <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in-up">
              {adminLink}
              
              <Link 
                href="https://www.ruanbueno.cloud/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block px-4 py-3 rounded-xl font-medium transition-all duration-300 glass-card hover:shadow-glow"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative z-10 text-slate-700 dark:text-slate-300 group-hover:text-accent-600 dark:group-hover:text-accent-400 flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Portfólio</span>
                </span>
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full group relative block px-4 py-3 rounded-xl font-medium transition-all duration-300 glass-card hover:shadow-glow text-left"
                >
                  <span className="relative z-10 text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium text-center transition-all duration-300 hover:scale-105"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
