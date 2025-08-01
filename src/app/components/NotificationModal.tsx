'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Interface para uma notificação
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Duração em ms, 0 = não fecha automaticamente
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Interface para o contexto
interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Contexto das notificações
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook para usar notificações
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
};

// Props do provider
interface NotificationProviderProps {
  children: ReactNode;
}

// Provider das notificações
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // 5 segundos por padrão
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover se tiver duração
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, newNotification.duration);
    }
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, clearAllNotifications }}>
      {children}
      <NotificationContainer notifications={notifications} onHide={hideNotification} />
    </NotificationContext.Provider>
  );
}

// Props do container
interface NotificationContainerProps {
  notifications: Notification[];
  onHide: (id: string) => void;
}

// Container das notificações
function NotificationContainer({ notifications, onHide }: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={() => onHide(notification.id)}
        />
      ))}
    </div>
  );
}

// Props do item
interface NotificationItemProps {
  notification: Notification;
  onHide: () => void;
}

// Item individual da notificação
function NotificationItem({ notification, onHide }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleHide = () => {
    setIsVisible(false);
    setTimeout(onHide, 300); // Aguarda a animação de saída
  };

  // Configurações por tipo
  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-200',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-200',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-200',
        };
    }
  };

  const config = getNotificationConfig(notification.type);
  const IconComponent = config.icon;

  return (
    <div
      className={`
        glass-card border rounded-xl p-4 shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Ícone */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${config.titleColor}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {notification.message}
              </p>
              
              {/* Botão de ação */}
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  {notification.action.label}
                </button>
              )}
            </div>

            {/* Botão fechar */}
            <button
              onClick={handleHide}
              className="flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de exemplo para demonstração
export function NotificationDemo() {
  const { showNotification } = useNotifications();

  const showSuccess = () => {
    showNotification({
      type: 'success',
      title: 'Sucesso!',
      message: 'Operação realizada com sucesso.',
    });
  };

  const showError = () => {
    showNotification({
      type: 'error',
      title: 'Erro!',
      message: 'Ocorreu um erro durante a operação.',
    });
  };

  const showWarning = () => {
    showNotification({
      type: 'warning',
      title: 'Atenção!',
      message: 'Esta ação pode ter consequências.',
    });
  };

  const showInfo = () => {
    showNotification({
      type: 'info',
      title: 'Informação',
      message: 'Esta é uma mensagem informativa.',
    });
  };

  const showPersistent = () => {
    showNotification({
      type: 'info',
      title: 'Notificação Persistente',
      message: 'Esta notificação não fecha automaticamente.',
      duration: 0,
      action: {
        label: 'Fechar',
        onClick: () => console.log('Fechar clicado'),
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Testar Notificações</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={showSuccess}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Sucesso
        </button>
        <button
          onClick={showError}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Erro
        </button>
        <button
          onClick={showWarning}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Aviso
        </button>
        <button
          onClick={showInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Info
        </button>
        <button
          onClick={showPersistent}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Persistente
        </button>
      </div>
    </div>
  );
} 