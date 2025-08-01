#!/bin/bash

# Script para configurar o cron job do sistema de agendamento
# Este script adiciona uma entrada no crontab para executar o script de agendamento a cada 5 minutos

echo "🚀 Configurando cron job para o sistema de agendamento..."

# Obter o diretório atual do projeto
PROJECT_DIR=$(pwd)
SCRIPT_PATH="$PROJECT_DIR/scripts/schedule-posts.js"

echo "📁 Diretório do projeto: $PROJECT_DIR"
echo "📄 Script de agendamento: $SCRIPT_PATH"

# Verificar se o script existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Erro: Script de agendamento não encontrado em $SCRIPT_PATH"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

# Criar a entrada do cron job (executar a cada 5 minutos)
CRON_JOB="*/5 * * * * cd $PROJECT_DIR && node scripts/schedule-posts.js >> logs/schedule.log 2>&1"

echo "⏰ Configurando cron job para executar a cada 5 minutos..."
echo "📝 Entrada do cron: $CRON_JOB"

# Criar diretório de logs se não existir
mkdir -p logs

# Adicionar ao crontab (sem duplicatas)
(crontab -l 2>/dev/null | grep -v "schedule-posts.js"; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job configurado com sucesso!"
    echo "📋 Cron jobs ativos:"
    crontab -l | grep schedule-posts.js || echo "Nenhum cron job encontrado"
else
    echo "❌ Erro ao configurar cron job"
    exit 1
fi

echo ""
echo "📖 Para verificar os logs do agendamento:"
echo "   tail -f logs/schedule.log"
echo ""
echo "📖 Para remover o cron job:"
echo "   crontab -e"
echo "   (remova a linha com schedule-posts.js)"
echo ""
echo "🎉 Configuração concluída!" 