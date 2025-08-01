'use client';

import { useNotifications, NotificationDemo } from "~/app/components/NotificationModal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotificationsDemoPage() {
  const { showNotification } = useNotifications();

  const showCustomSuccess = () => {
    showNotification({
      type: 'success',
      title: 'Operação Concluída',
      message: 'A operação foi realizada com sucesso. Todos os dados foram salvos corretamente.',
      duration: 8000,
      action: {
        label: 'Ver detalhes',
        onClick: () => console.log('Ver detalhes clicado')
      }
    });
  };

  const showCustomError = () => {
    showNotification({
      type: 'error',
      title: 'Erro Crítico',
      message: 'Ocorreu um erro inesperado durante o processamento. Tente novamente ou entre em contato com o suporte.',
      duration: 0, // Não fecha automaticamente
      action: {
        label: 'Reportar bug',
        onClick: () => console.log('Reportar bug clicado')
      }
    });
  };

  const showCustomWarning = () => {
    showNotification({
      type: 'warning',
      title: 'Ação Destrutiva',
      message: 'Esta ação irá excluir permanentemente todos os dados. Esta operação não pode ser desfeita.',
      duration: 10000,
      action: {
        label: 'Confirmar exclusão',
        onClick: () => {
          showNotification({
            type: 'success',
            title: 'Exclusão Confirmada',
            message: 'Os dados foram excluídos com sucesso.',
          });
        }
      }
    });
  };

  const showCustomInfo = () => {
    showNotification({
      type: 'info',
      title: 'Nova Funcionalidade',
      message: 'O sistema de notificações foi implementado com sucesso! Agora você pode receber feedback visual de todas as operações.',
      duration: 6000,
    });
  };

  const showMultipleNotifications = () => {
    showNotification({
      type: 'info',
      title: 'Iniciando Processo',
      message: 'O processo foi iniciado com sucesso.',
      duration: 3000,
    });

    setTimeout(() => {
      showNotification({
        type: 'warning',
        title: 'Processando...',
        message: 'Aguarde enquanto processamos os dados.',
        duration: 3000,
      });
    }, 1000);

    setTimeout(() => {
      showNotification({
        type: 'success',
        title: 'Processo Concluído',
        message: 'Todos os dados foram processados com sucesso!',
        duration: 5000,
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="group inline-flex items-center space-x-2 glass-card rounded-xl px-4 py-2 mb-4 hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors group-hover:-translate-x-1" />
            <span className="text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Voltar ao Admin
            </span>
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Sistema de Notificações
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Teste o sistema de notificações do blog
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demonstração Básica */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Demonstração Básica
            </h2>
            <NotificationDemo />
          </div>

          {/* Demonstração Avançada */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Demonstração Avançada
            </h2>
            <div className="space-y-4">
              <button
                onClick={showCustomSuccess}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Sucesso com Ação
              </button>
              
              <button
                onClick={showCustomError}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Erro Persistente
              </button>
              
              <button
                onClick={showCustomWarning}
                className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                Aviso com Confirmação
              </button>
              
              <button
                onClick={showCustomInfo}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Informação Detalhada
              </button>
              
              <button
                onClick={showMultipleNotifications}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Múltiplas Notificações
              </button>
            </div>
          </div>
        </div>

        {/* Documentação */}
        <div className="glass-card rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Como Usar
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <h3>Tipos de Notificação</h3>
            <ul>
              <li><strong>Success:</strong> Para operações bem-sucedidas</li>
              <li><strong>Error:</strong> Para erros e problemas</li>
              <li><strong>Warning:</strong> Para avisos e alertas</li>
              <li><strong>Info:</strong> Para informações gerais</li>
            </ul>

            <h3>Exemplo de Uso</h3>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto">
{`import { useNotifications } from "~/app/components/NotificationModal";

const { showNotification } = useNotifications();

showNotification({
  type: 'success',
  title: 'Sucesso!',
  message: 'Operação realizada com sucesso.',
  duration: 5000, // 5 segundos (opcional)
  action: {        // opcional
    label: 'Ver detalhes',
    onClick: () => console.log('Ação clicada')
  }
});`}
            </pre>

            <h3>Características</h3>
            <ul>
              <li>✅ Animações suaves de entrada e saída</li>
              <li>✅ Auto-fechamento configurável</li>
              <li>✅ Botões de ação personalizáveis</li>
              <li>✅ Múltiplas notificações simultâneas</li>
              <li>✅ Design responsivo e acessível</li>
              <li>✅ Suporte a tema claro/escuro</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 