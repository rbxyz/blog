# Sistema de Newsletter

## Visão Geral

O blog agora possui um sistema completo de newsletter com portabilidade de versão para HTML, permitindo enviar artigos diretamente para os inscritos via email. O sistema inclui gerenciamento de inscrições, configuração SMTP, templates HTML responsivos e métricas detalhadas.

## Funcionalidades Principais

### ✅ **Sistema de Inscrições**
- Formulário de inscrição na página principal
- Validação de email e nome opcional
- Prevenção de inscrições duplicadas
- Reativação automática de inscrições canceladas
- Rastreamento de origem da inscrição

### ✅ **Configuração SMTP**
- Interface administrativa para configuração
- Suporte a múltiplos provedores (Gmail, Outlook, etc.)
- Configuração de porta, segurança e autenticação
- Teste de conexão automático

### ✅ **Geração de HTML**
- Templates responsivos e modernos
- Conversão automática de markdown para HTML
- Suporte a imagens e metadados
- Links de cancelamento automáticos
- Preview no painel administrativo

### ✅ **Envio de Newsletters**
- Envio em massa para todos os inscritos ativos
- Logs detalhados de envio
- Tratamento de erros e retry
- Métricas de entrega, abertura e clique

### ✅ **Métricas e KPIs**
- Total de inscritos ativos/inativos
- Taxa de abertura e clique
- Histórico de envios
- Estatísticas dos últimos 30 dias
- Detecção de cancelamentos

## Estrutura do Banco de Dados

### NewsletterSubscriber
```sql
model NewsletterSubscriber {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String?
  isActive        Boolean   @default(true)
  subscribedAt    DateTime  @default(now())
  unsubscribedAt  DateTime?
  source          String?   // Como se inscreveu
  metadata        Json?     // Dados adicionais

  // Relations
  emailLogs       NewsletterEmailLog[]

  @@map("newsletter_subscribers")
}
```

### NewsletterEmailLog
```sql
model NewsletterEmailLog {
  id           String      @id @default(uuid())
  subscriberId String
  postId       String?
  emailType    EmailType
  status       EmailStatus
  sentAt       DateTime    @default(now())
  openedAt     DateTime?
  clickedAt    DateTime?
  error        String?

  // Relations
  subscriber   NewsletterSubscriber @relation(fields: [subscriberId], references: [id], onDelete: Cascade)
  post         Post?               @relation(fields: [postId], references: [id], onDelete: SetNull)

  @@map("newsletter_email_logs")
}
```

### SmtpConfig
```sql
model SmtpConfig {
  id        String   @id @default(uuid())
  host      String
  port      Int
  secure    Boolean  @default(true)
  username  String
  password  String
  fromEmail String
  fromName  String
  isActive  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("smtp_configs")
}
```

## APIs Disponíveis

### Inscrição na Newsletter
```typescript
POST /api/trpc/newsletter.subscribe
{
  email: string;
  name?: string;
  source?: string;
  metadata?: Record<string, any>;
}
```

### Cancelamento de Inscrição
```typescript
POST /api/trpc/newsletter.unsubscribe
{
  email: string;
}
```

### Estatísticas (Admin)
```typescript
GET /api/trpc/newsletter.getStats
// Retorna métricas completas da newsletter
```

### Configuração SMTP (Admin)
```typescript
GET /api/trpc/newsletter.getSmtpConfig
POST /api/trpc/newsletter.updateSmtpConfig
```

### Envio de Newsletter (Admin)
```typescript
POST /api/trpc/newsletter.sendNewsletter
{
  postId: string;
}
```

### Geração de HTML (Admin)
```typescript
GET /api/trpc/newsletter.generateNewsletterHTML
{
  postId: string;
}
```

## Componentes da Interface

### NewsletterSignup
Componente de inscrição disponível em duas variantes:
- **default**: Formulário completo com nome e email
- **compact**: Versão simplificada apenas com email

### Páginas Especiais
- `/newsletter/unsubscribe?email=...` - Cancelamento de inscrição
- Painel admin com aba "Newsletter" completa

## Templates HTML

### Newsletter Principal
- Design responsivo e moderno
- Cabeçalho com logo e branding
- Imagem do post (se disponível)
- Título e autor
- Resumo do conteúdo (300 caracteres)
- Botão "Ler artigo completo"
- Rodapé com link de cancelamento

### Email de Boas-vindas
- Mensagem personalizada
- Confirmação de inscrição
- Informações sobre a newsletter

## Configuração SMTP

### Provedores Suportados
- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Provedores personalizados**

### Configuração Recomendada (Gmail)
```
Host: smtp.gmail.com
Port: 587
Secure: false
Username: seu-email@gmail.com
Password: [Token de App do Gmail]
From Email: newsletter@seudominio.com
From Name: Blog Ruan
```

## Painel Administrativo

### Nova Aba "Newsletter"
1. **Estatísticas Gerais**
   - Total de inscritos ativos
   - Emails enviados
   - Taxa de abertura
   - Taxa de clique

2. **Configuração SMTP**
   - Formulário completo de configuração
   - Teste de conexão
   - Ativação/desativação

3. **Ações da Newsletter**
   - Envio de newsletter para post específico
   - Geração de HTML para preview
   - Seleção de posts publicados

## Fluxo de Funcionamento

### 1. Inscrição
1. Usuário preenche formulário na página principal
2. Sistema valida email e cria inscrição
3. Email de boas-vindas é enviado automaticamente
4. Log de email é registrado

### 2. Envio de Newsletter
1. Admin seleciona post no painel
2. Sistema gera HTML da newsletter
3. Busca todos os inscritos ativos
4. Envia emails em lote
5. Registra logs de envio

### 3. Cancelamento
1. Usuário clica em link de cancelamento
2. Sistema marca inscrição como inativa
3. Registra data de cancelamento
4. Confirma cancelamento

## Métricas e KPIs

### Métricas Principais
- **Inscritos Ativos**: Total de emails válidos
- **Taxa de Abertura**: % de emails abertos
- **Taxa de Clique**: % de cliques em links
- **Taxa de Cancelamento**: % de cancelamentos

### Estatísticas Temporais
- Novos inscritos (últimos 30 dias)
- Emails enviados (últimos 30 dias)
- Emails abertos (últimos 30 dias)

## Segurança e Privacidade

### Proteções Implementadas
- Validação de email
- Prevenção de spam
- Links de cancelamento seguros
- Logs de auditoria
- Dados criptografados

### Conformidade
- Links de cancelamento obrigatórios
- Rastreamento de origem
- Metadados de inscrição
- Histórico de ações

## Scripts de Teste

### test-newsletter.js
Testa todas as funcionalidades:
- Criação de configuração SMTP
- Inscrições na newsletter
- Cancelamentos
- Estatísticas
- Limpeza de dados de teste

## Configuração de Produção

### Variáveis de Ambiente
```env
NEXTAUTH_URL=https://seudominio.com
DATABASE_URL=postgresql://...
```

### Configuração SMTP Recomendada
1. Use token de app (não senha)
2. Configure domínio de envio
3. Teste conexão antes de ativar
4. Monitore logs de envio

## Monitoramento

### Logs Importantes
- `Serviço de email inicializado com sucesso`
- `Email enviado: [messageId]`
- `Nova visualização registrada`
- `Erro ao enviar email: [error]`

### Alertas Recomendados
- Taxa de abertura < 20%
- Taxa de cancelamento > 5%
- Erros de envio > 10%
- Falhas de configuração SMTP

## Próximos Passos

### Melhorias Futuras
1. **Segmentação**: Envio para grupos específicos
2. **Automação**: Envio automático ao publicar
3. **A/B Testing**: Teste de diferentes templates
4. **Analytics Avançado**: Tracking de cliques
5. **Integração**: APIs de terceiros (Mailchimp, etc.)

### Otimizações
1. **Cache**: Cache de templates HTML
2. **Queue**: Sistema de filas para envios
3. **Rate Limiting**: Limite de envios por hora
4. **Bounce Handling**: Tratamento de emails inválidos 