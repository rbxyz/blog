#!/bin/bash

# 🚀 Script para Criar Admin - Ruan Bueno
# Este script insere o usuário admin no banco de dados

echo "🚀 Configurando Admin para o Blog..."
echo ""

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "💡 Certifique-se de ter o arquivo .env configurado com DATABASE_URL"
    exit 1
fi

# Carregar variáveis do .env
export $(grep -v '^#' .env | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrada no .env!"
    exit 1
fi

echo "📊 Executando script SQL..."
echo ""

# Executar o script SQL usando psql
if command -v psql &> /dev/null; then
    # Usar psql se disponível
    psql "$DATABASE_URL" -f scripts/insert-admin.sql
elif command -v npx &> /dev/null; then
    # Usar Prisma DB Execute como alternativa
    echo "🔧 Usando Prisma para executar SQL..."
    npx prisma db execute --file scripts/insert-admin.sql
else
    echo "❌ Nem psql nem npx encontrados!"
    echo "💡 Instale PostgreSQL client ou execute manualmente:"
    echo ""
    echo "📄 Conteúdo do arquivo SQL:"
    cat scripts/insert-admin.sql
    exit 1
fi

echo ""
echo "✅ Admin configurado com sucesso!"
echo ""
echo "📋 Credenciais de Login:"
echo "  📧 Email: ruan@ruanbueno.cloud"
echo "  🔒 Senha: admin123"
echo ""
echo "🌐 Acesse: http://localhost:3000/auth/login"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha após o primeiro login!" 