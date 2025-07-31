# Configuração da Newsletter

Este documento explica como configurar e usar o sistema de newsletter do blog.

## 📋 Pré-requisitos

1. **Banco de dados PostgreSQL** configurado e funcionando
2. **Redis** (opcional, para sistema de filas)
3. **Credenciais SMTP** de um provedor de email

## 🚀 Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Redis (para sistema de filas)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# SMTP Configuration (exemplo para Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USERNAME="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-de-app"
SMTP_FROM_EMAIL="seu-email@gmail.com"
SMTP_FROM_NAME="Blog Ruan"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Executar Migrações

```bash
npm run db:migrate
```

### 3. Configurar Newsletter

```bash
npm run newsletter:setup
```

Este comando irá:
- Criar template padrão
- Criar configuração SMTP inicial (desativada)
- Criar inscritos de exemplo
- Testar o serviço de email

## 📧 Configuração SMTP

### Gmail

1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma senha de app:
   - Vá em "Gerenciar sua Conta Google"
   - Segurança > Verificação em duas etapas > Senhas de app
   - Gere uma senha para "Email"
3. Use as seguintes configurações:
   - **Host:** `smtp.gmail.com`
   - **Porta:** `587`
   - **Seguro:** `false`
   - **Usuário:** seu email Gmail
   - **Senha:** senha de app gerada

### Outlook/Hotmail

- **Host:** `smtp-mail.outlook.com`
- **Porta:** `587`
- **Seguro:** `false`

### Outros Provedores

Consulte a documentação do seu provedor de email para as configurações SMTP corretas.

## 🎛️ Configuração no Painel Admin

1. Acesse o painel admin: `/admin`
2. Vá para a aba "Newsletter"
3. Configure as credenciais SMTP:
   - Preencha todos os campos
   - Marque "Ativar configuração"
   - Clique em "Salvar Configuração"
4. Teste o envio:
   - Selecione um post
   - Clique em "Enviar Newsletter"

## 📊 Funcionalidades

### Envio Manual
- Selecione um post no painel admin
- Clique em "Enviar Newsletter"
- O sistema enviará para todos os inscritos ativos

### Sistema de Filas (Opcional)
Se você configurar o Redis, pode usar o sistema de filas:

```bash
# Instalar Redis (Ubuntu/Debian)
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
```

### Tracking
O sistema rastreia:
- Emails enviados
- Emails abertos
- Links clicados
- Taxa de entrega

### Templates
- Template padrão incluído
- Suporte a variáveis personalizadas
- CSS customizável

## 🔧 Troubleshooting

### Erro de Autenticação SMTP
- Verifique se as credenciais estão corretas
- Para Gmail, certifique-se de usar uma senha de app
- Verifique se a verificação em duas etapas está ativa

### Emails não sendo enviados
- Verifique se a configuração SMTP está ativa
- Teste a conexão no painel admin
- Verifique os logs do servidor

### Erro de Conexão com Redis
- Verifique se o Redis está rodando
- Confirme as configurações de host/porta
- O sistema funcionará sem Redis (envio direto)

## 📈 Monitoramento

### Estatísticas Disponíveis
- Total de inscritos
- Inscritos ativos
- Emails enviados
- Taxa de abertura
- Taxa de clique
- Novos inscritos (últimos 30 dias)

### Logs
- Logs de envio de email
- Logs de tracking
- Logs de erros

## 🔒 Segurança

- Senhas SMTP são criptografadas no banco
- Suporte a conexões SSL/TLS
- Rate limiting para evitar spam
- Validação de emails

## 📝 Próximos Passos

1. Configure suas credenciais SMTP
2. Teste o envio de newsletter
3. Personalize o template se necessário
4. Configure o Redis para sistema de filas (opcional)
5. Monitore as estatísticas de envio 