# 📋 Manual de Configuração - Correções e Melhorias

## 🚨 Problemas Identificados e Soluções

### 1. **URL Inválida ao Inserir do Spotify**

#### **Problema:**
- Validação inadequada de URLs do Spotify
- Falta de feedback visual para URLs inválidas
- Não há validação em tempo real

#### **Solução Implementada:**

```typescript
// Validação melhorada de URL do Spotify
const validateSpotifyUrl = (url: string): boolean => {
  const spotifyRegex = /^https:\/\/open\.spotify\.com\/(playlist|album|track)\/[a-zA-Z0-9]+(\?.*)?$/;
  return spotifyRegex.test(url);
};

// Feedback visual em tempo real
const [spotifyUrlError, setSpotifyUrlError] = useState<string | null>(null);

const handleSpotifyUrlChange = (url: string) => {
  if (url && !validateSpotifyUrl(url)) {
    setSpotifyUrlError('URL do Spotify inválida. Use: https://open.spotify.com/playlist/...');
  } else {
    setSpotifyUrlError(null);
  }
  setFormData(prev => ({ ...prev, spotifyPlaylistUrl: url }));
};
```

#### **URLs Suportadas:**
```
✅ https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
✅ https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy
✅ https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
❌ https://spotify.com/playlist/... (sem https://open.)
❌ https://youtube.com/... (domínio incorreto)
```

---

### 2. **Editar Deve Poder Trocar Link**

#### **Problema:**
- Página de edição não permite alterar URL do Spotify
- Campos de áudio e podcast não estão disponíveis na edição

#### **Solução Implementada:**

```typescript
// Adicionar campos na página de edição
const [formData, setFormData] = useState({
  title: "",
  content: "",
  imageUrl: "",
  audioUrl: "",
  audioDuration: 0,
  spotifyPlaylistUrl: "",
  hasAudio: false,
  published: false,
  scheduledAt: null,
});

// Carregar dados completos do post
useEffect(() => {
  if (post) {
    setFormData({
      title: post.title ?? "",
      content: post.content ?? "",
      imageUrl: post.imageUrl ?? "",
      audioUrl: post.audioUrl ?? "",
      audioDuration: post.audioDuration ?? 0,
      spotifyPlaylistUrl: post.spotifyPlaylistUrl ?? "",
      hasAudio: post.hasAudio ?? false,
      published: post.published ?? false,
      scheduledAt: post.scheduledAt,
    });
  }
}, [post]);
```

---

### 3. **Postagens em Rascunho Aparecem na Página Principal**

#### **Problema:**
- Query `recent` não filtra por status `published`
- Posts em rascunho aparecem publicamente

#### **Solução Implementada:**

```typescript
// Corrigir query para filtrar apenas posts publicados
recent: publicProcedure.query(async () => {
  return await prisma.post.findMany({
    where: { published: true }, // 🔥 FILTRO ADICIONADO
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}),

// Corrigir query principal também
all: publicProcedure.query(async () => {
  return await prisma.post.findMany({
    where: { published: true }, // 🔥 FILTRO ADICIONADO
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      imageUrl: true,
      slug: true,
      viewCount: true,
      published: true,
      createdAt: true,
    },
  });
}),
```

---

### 4. **Não Tem Botão de Agendamento de Postagem**

#### **Problema:**
- Falta funcionalidade de agendamento
- Não há interface para definir data/hora de publicação

#### **Solução Implementada:**

```typescript
// Adicionar campos de agendamento
const [schedulingData, setSchedulingData] = useState({
  isScheduled: false,
  scheduledDate: '',
  scheduledTime: '',
});

// Componente de agendamento
const SchedulingSection = () => (
  <div className="glass-card rounded-2xl p-6">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
      <Calendar className="w-4 h-4 inline mr-2" />
      Agendamento de Publicação
    </label>
    
    <div className="space-y-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={schedulingData.isScheduled}
          onChange={(e) => setSchedulingData(prev => ({
            ...prev,
            isScheduled: e.target.checked
          }))}
          className="rounded border-slate-300"
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Agendar publicação
        </span>
      </label>
      
      {schedulingData.isScheduled && (
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={schedulingData.scheduledDate}
            onChange={(e) => setSchedulingData(prev => ({
              ...prev,
              scheduledDate: e.target.value
            }))}
            min={new Date().toISOString().split('T')[0]}
            className="p-3 rounded-xl glass border"
          />
          <input
            type="time"
            value={schedulingData.scheduledTime}
            onChange={(e) => setSchedulingData(prev => ({
              ...prev,
              scheduledTime: e.target.value
            }))}
            className="p-3 rounded-xl glass border"
          />
        </div>
      )}
    </div>
  </div>
);
```

---

### 5. **Newsletter Não Salva**

#### **Problema:**
- Falta de tratamento de erros na inscrição
- Não há feedback visual do status
- Possível problema na mutação TRPC

#### **Solução Implementada:**

```typescript
// Melhorar componente de newsletter
const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribeMutation = api.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage(data.message || 'Inscrição realizada com sucesso!');
      setEmail('');
      setName('');
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Erro ao realizar inscrição');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await subscribeMutation.mutateAsync({
        email: email.trim(),
        name: name.trim() || undefined,
        source: 'website_form',
      });
    } catch (error) {
      // Erro já tratado no onError
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos do formulário */}
      {status === 'success' && (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-xl">
          <p className="text-green-600 dark:text-green-400">{message}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-xl">
          <p className="text-red-600 dark:text-red-400">{message}</p>
        </div>
      )}
    </form>
  );
};
```

---

## 🔧 Implementação das Correções

### **Passo 1: Atualizar Schema do Banco**

```sql
-- Adicionar campos de agendamento se não existirem
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
```

### **Passo 2: Atualizar Router de Posts**

```typescript
// src/server/api/routers/post.ts
export const postRouter = createTRPCRouter({
  // Corrigir queries para filtrar apenas posts publicados
  all: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      where: { published: true }, // 🔥 FILTRO ADICIONADO
      orderBy: { createdAt: "desc" },
      // ... resto do código
    });
  }),

  recent: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      where: { published: true }, // 🔥 FILTRO ADICIONADO
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }),

  // Adicionar mutation para agendamento
  schedule: protectedProcedure
    .input(z.object({
      id: z.string(),
      scheduledAt: z.date().optional(),
      published: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: { id: input.id },
        data: {
          scheduledAt: input.scheduledAt,
          published: input.published,
          publishedAt: input.published ? new Date() : null,
        },
      });
    }),
});
```

### **Passo 3: Atualizar Componentes**

#### **Página de Edição Melhorada:**
```typescript
// src/app/admin/posts/edit/[id]/page.tsx
// Adicionar seções para:
// - Validação de URL do Spotify
// - Campos de áudio/podcast
// - Agendamento de publicação
// - Status de publicação
```

#### **Validação de Spotify Melhorada:**
```typescript
// src/app/components/SpotifyPlaylist.tsx
const validateSpotifyUrl = (url: string): boolean => {
  const spotifyRegex = /^https:\/\/open\.spotify\.com\/(playlist|album|track)\/[a-zA-Z0-9]+(\?.*)?$/;
  return spotifyRegex.test(url);
};
```

### **Passo 4: Sistema de Agendamento**

#### **Cron Job para Publicação Automática:**
```typescript
// scripts/schedule-posts.js
const { prisma } = require('../src/server/db');

async function publishScheduledPosts() {
  const now = new Date();
  
  const scheduledPosts = await prisma.post.findMany({
    where: {
      scheduledAt: { lte: now },
      published: false,
    },
  });

  for (const post of scheduledPosts) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        published: true,
        publishedAt: now,
        scheduledAt: null,
      },
    });
    
    console.log(`✅ Post "${post.title}" publicado automaticamente`);
  }
}

// Executar a cada 5 minutos
setInterval(publishScheduledPosts, 5 * 60 * 1000);
```

---

## 📋 Checklist de Implementação

### **✅ Correções Críticas:**
- [ ] Filtrar posts publicados na página principal
- [ ] Validar URLs do Spotify em tempo real
- [ ] Adicionar campos de áudio/podcast na edição
- [ ] Corrigir salvamento da newsletter
- [ ] Implementar agendamento de posts

### **✅ Melhorias de UX:**
- [ ] Feedback visual para URLs inválidas
- [ ] Indicadores de status de publicação
- [ ] Preview de agendamento
- [ ] Confirmações de ações importantes

### **✅ Funcionalidades Avançadas:**
- [ ] Sistema de agendamento automático
- [ ] Validação robusta de URLs
- [ ] Logs de atividades
- [ ] Métricas de publicação

---

## 🚀 Próximos Passos

1. **Implementar correções críticas primeiro**
2. **Testar todas as funcionalidades**
3. **Adicionar melhorias de UX**
4. **Configurar sistema de agendamento**
5. **Documentar novas funcionalidades**

---

## 📞 Suporte

Para dúvidas ou problemas durante a implementação:
1. Verificar logs do console
2. Validar configurações do banco
3. Testar endpoints individualmente
4. Consultar documentação específica de cada módulo 