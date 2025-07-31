# Sistema de Rastreamento de Visualizações Únicas

## Visão Geral

O blog agora possui um sistema avançado de rastreamento de visualizações que contabiliza apenas visualizações únicas por usuário/sessão, evitando contagens infladas por múltiplos acessos da mesma pessoa.

## Funcionalidades

### ✅ Visualizações Únicas por Sessão
- Cada sessão de navegador é identificada por um ID único
- Visualizações repetidas da mesma sessão não incrementam o contador
- Suporte para usuários autenticados e anônimos

### ✅ Detecção de Usuários
- **Usuários autenticados**: Vinculados ao ID do usuário
- **Usuários anônimos**: Identificados por sessão + IP + User Agent
- Prevenção contra contagens duplicadas

### ✅ Estatísticas Detalhadas
- Contador total de visualizações únicas
- Separação entre usuários autenticados e anônimos
- Detecção de IPs suspeitos (possíveis bots)
- Histórico de visualizações por data

## Estrutura do Banco de Dados

### Modelo PostView
```sql
model PostView {
  id        String   @id @default(uuid())
  postId    String
  userId    String?  // Null para usuários não autenticados
  sessionId String   // ID único da sessão do navegador
  ipAddress String?  // Endereço IP para detecção adicional
  userAgent String?  // User agent para identificação
  createdAt DateTime @default(now())

  // Relações
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@unique([postId, sessionId]) // Garante uma visualização única por sessão
}
```

## Como Funciona

### 1. Middleware de Rastreamento
- Intercepta requisições para páginas de posts (`/post/[slug]`)
- Extrai informações do usuário (IP, User Agent, Session ID)
- Registra visualização de forma assíncrona (não bloqueia a resposta)

### 2. Componente ViewTracker
- Executa no lado do cliente após carregamento da página
- Faz requisição POST para `/api/posts/[slug]/view`
- Garante que a visualização seja registrada mesmo se o middleware falhar

### 3. Endpoint de Registro
- `/api/posts/[slug]/view` - Registra nova visualização
- Verifica se já existe visualização para a sessão
- Usa transações para garantir consistência dos dados

### 4. Endpoint de Estatísticas
- `/api/posts/[slug]/stats` - Retorna estatísticas detalhadas
- Inclui métricas de usuários únicos, autenticados vs anônimos
- Detecta possíveis bots por IP

## APIs Disponíveis

### POST /api/posts/[slug]/view
Registra uma nova visualização única.

**Resposta:**
```json
{
  "success": true,
  "message": "Visualização registrada com sucesso",
  "viewCount": 42
}
```

### GET /api/posts/[slug]/stats
Retorna estatísticas detalhadas do post.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "...",
      "title": "...",
      "slug": "..."
    },
    "statistics": {
      "totalViews": 100,
      "uniqueViews": 85,
      "authenticatedViews": 30,
      "anonymousViews": 55,
      "recentViews": 12,
      "suspiciousIPs": [
        { "ip": "192.168.1.100", "count": 8 }
      ]
    },
    "views": [...]
  }
}
```

## Painel Administrativo

### Nova Aba "Analytics"
- Estatísticas gerais de visualizações
- Posts mais visualizados
- Links para estatísticas detalhadas de cada post
- Métricas de usuários únicos vs totais

## Scripts de Teste

### scripts/test-views.js
Testa o sistema de visualizações únicas:
- Simula múltiplas visualizações da mesma sessão
- Simula visualizações de sessões diferentes
- Verifica se o contador é incrementado corretamente

### scripts/cleanup-test-views.js
Remove dados de teste:
- Deleta visualizações com sessionId começando com "test-session"
- Reseta contadores para 0

## Vantagens do Sistema

### 🎯 Precisão
- Conta apenas visualizações únicas
- Evita inflação por refreshes ou múltiplos acessos

### 🔒 Segurança
- Detecção de possíveis bots
- Identificação por múltiplos fatores (IP, User Agent, Session)

### 📊 Análise
- Estatísticas detalhadas
- Separação entre usuários autenticados e anônimos
- Histórico temporal de visualizações

### ⚡ Performance
- Rastreamento assíncrono (não bloqueia carregamento)
- Transações para garantir consistência
- Índices otimizados no banco de dados

## Configuração

O sistema funciona automaticamente após a migração do banco de dados. Não são necessárias configurações adicionais.

## Monitoramento

### Logs Importantes
- `Nova visualização registrada` - Visualização única registrada
- `Visualização já registrada para esta sessão` - Tentativa de duplicação
- `Erro ao processar visualização` - Problemas no rastreamento

### Métricas a Observar
- Diferença entre `totalViews` e `uniqueViews`
- Número de `suspiciousIPs`
- Proporção de usuários autenticados vs anônimos 