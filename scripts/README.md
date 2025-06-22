# 🔧 Scripts de Administração

Este diretório contém scripts para gerenciar usuários administradores do blog.

## 📋 Scripts Disponíveis

### 🚀 Setup Rápido do Admin (Recomendado)

Para inserir **Ruan Bueno** como administrador com configurações pré-definidas:

```bash
# Método 1: Via npm script
npm run admin:setup

# Método 2: Executar diretamente
./scripts/setup-admin.sh

# Método 3: SQL direto
psql $DATABASE_URL -f scripts/insert-admin.sql
```

**Credenciais criadas:**
- 📧 **Email**: `ruan@ruanbueno.cloud`
- 🔒 **Senha**: `admin123`
- 👤 **Nome**: `Ruan Bueno`
- 🎯 **Role**: `ADMIN`

### 🎨 Criação Interativa de Admin

Para criar um admin personalizado com input interativo:

```bash
npm run admin:create
```

Este script irá:
- ✅ Verificar se já existe admin
- 📝 Pedir nome, email e senha
- 🔒 Hash da senha automaticamente
- 💾 Salvar no banco de dados
- 🎉 Confirmar criação

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `insert-admin.sql` | Script SQL puro para inserir Ruan Bueno como admin |
| `setup-admin.sh` | Script bash que executa o SQL automaticamente |
| `create-admin.js` | Script Node.js interativo para criar admin personalizado |

## 🔧 Pré-requisitos

### Para `setup-admin.sh`:
- ✅ Arquivo `.env` configurado com `DATABASE_URL`
- ✅ PostgreSQL client (`psql`) ou Prisma instalado
- ✅ Banco de dados rodando

### Para `create-admin.js`:
- ✅ Node.js instalado
- ✅ Dependências do projeto (`npm install`)
- ✅ Prisma configurado
- ✅ Banco de dados rodando

## 🛡️ Segurança

⚠️ **IMPORTANTE**: Altere a senha padrão `admin123` após o primeiro login!

O hash bcrypt usado:
```
$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewT5X5D5P5QXkNEG
```

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não encontrada"
```bash
# Verifique se o .env existe
ls -la .env

# Verifique o conteúdo
grep DATABASE_URL .env
```

### Erro: "psql command not found"
```bash
# No Ubuntu/Debian
sudo apt install postgresql-client

# No macOS
brew install postgresql

# Ou use Prisma como alternativa
npx prisma db execute --file scripts/insert-admin.sql
```

### Erro: "Email já existe"
O script SQL usa `ON CONFLICT` para atualizar o usuário existente se o email já estiver cadastrado.

## 🎯 Acesso ao Painel Admin

Após criar o admin:

1. 🌐 Acesse: http://localhost:3000/auth/login
2. 📧 Use: `ruan@ruanbueno.cloud`
3. 🔒 Senha: `admin123`
4. 🎉 Entre no painel: http://localhost:3000/admin

## ✨ Próximos Passos

Após o login:
1. 🔄 Altere a senha em configurações
2. 📝 Crie seu primeiro post
3. 🎨 Customize o blog
4. 🚀 Deploy para produção! 