# 🚀 **Blog Tech - Ruan Bueno**

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-11.x-2596BE?style=for-the-badge&logo=trpc)

**Uma plataforma moderna de blog com funcionalidades avançadas de edição e busca**

[🌐 **Ver Demo**](https://blog.ruanbueno.cloud) • [📖 **Documentação**](#-funcionalidades) • [🐛 **Reportar Bug**](https://github.com/rbxyz/blog/issues)

</div>

---

## 📖 **Sobre o Projeto**

Um blog moderno e responsivo desenvolvido para compartilhar conhecimentos sobre desenvolvimento web, tecnologia e inovação. Construído com as mais recentes tecnologias web, oferece uma experiência de usuário excepcional tanto para leitores quanto para administradores.

## ✨ **Funcionalidades**

### 🏠 **Interface Principal**
- ✅ **Design Glass Morphism** - Interface moderna com efeitos de vidro
- ✅ **Preview Inteligente** - Texto limpo sem marcação markdown
- ✅ **Cards Responsivos** - Layout adaptável para todos os dispositivos
- ✅ **Animações Suaves** - Transições e efeitos visuais modernos
- ✅ **Tema Dark/Light** - Alternância automática entre temas

### 🔍 **Sistema de Busca Avançado**
- ✅ **Busca Instantânea** - Resultados em tempo real
- ✅ **Busca Inteligente** - Por título, conteúdo e palavras-chave
- ✅ **Interface Moderna** - Dropdown com preview de imagens
- ✅ **Atalhos de Teclado** - `Ctrl + K` para abrir busca
- ✅ **Animações** - Efeitos de entrada e hover
- ✅ **Estados Visuais** - Loading, sem resultados, etc.

### ✍️ **Editor de Posts Profissional**
- ✅ **Editor Markdown** - Toolbar completa com botões
- ✅ **Preview em Tempo Real** - Visualização lado a lado
- ✅ **Upload de Imagens** - Drag & drop, paste (Ctrl+V) e seleção
- ✅ **Imagens Inline** - Inserção direta no conteúdo
- ✅ **Syntax Highlighting** - Destaque de código
- ✅ **Auto-save** - Prevenção de perda de dados

### 🖼️ **Gerenciamento de Mídia**
- ✅ **Upload Otimizado** - Limpeza automática de nomes
- ✅ **Múltiplos Formatos** - Suporte a PNG, JPG, WebP, etc.
- ✅ **Preview de Imagens** - Visualização antes da publicação
- ✅ **Compressão Automática** - Otimização de tamanho
- ✅ **CDN Ready** - Configurado para servir via CDN

### 🔐 **Sistema de Autenticação**
- ✅ **Login Seguro** - Hash de senhas e sessions
- ✅ **Controle de Acesso** - Permissões por role (Admin/User)
- ✅ **Sessões Persistentes** - Login automático
- ✅ **Middleware de Proteção** - Rotas protegidas

### 💬 **Sistema de Comentários**
- ✅ **Comentários Aninhados** - Respostas e discussões
- ✅ **Moderação** - Aprovação e exclusão
- ✅ **Notificações** - Sistema de alertas
- ✅ **Markdown Support** - Formatação nos comentários

### 📊 **Analytics e SEO**
- ✅ **Contador de Views** - Estatísticas de visualização
- ✅ **SEO Otimizado** - Meta tags dinâmicas
- ✅ **Open Graph** - Preview para redes sociais
- ✅ **Sitemap Automático** - Indexação otimizada
- ✅ **Structured Data** - Schema.org markup

### 🔗 **Funcionalidades Sociais**
- ✅ **Botão Compartilhar** - Web Share API + Clipboard
- ✅ **Links Diretos** - URLs amigáveis (slugs)
- ✅ **Páginas Otimizadas** - SSG para performance
- ✅ **Breadcrumbs** - Navegação contextual

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- **[Next.js 15.1.7](https://nextjs.org/)** - Framework React para produção
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[Lucide React](https://lucide.dev/)** - Ícones modernos
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Renderização de Markdown

### **Backend**
- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[Prisma](https://www.prisma.io/)** - ORM moderno
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados
- **[Zod](https://zod.dev/)** - Validação de esquemas

### **Markdown & Syntax Highlighting**
- **[Remark GFM](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown
- **[Rehype Highlight](https://github.com/rehypejs/rehype-highlight)** - Highlight de código
- **[Highlight.js](https://highlightjs.org/)** - Temas de sintaxe

### **Ferramentas de Desenvolvimento**
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Husky](https://typicode.github.io/husky/)** - Git hooks

## 🚀 **Como Executar o Projeto**

### **Pré-requisitos**
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### **Instalação**

1. **Clone o repositório**
```bash
git clone https://github.com/rbxyz/blog.git
cd blog
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/blog"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Execute as migrations do banco**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse o projeto**
```
http://localhost:3000
```

### **Scripts Disponíveis**

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
npm run db:studio    # Interface visual do banco
```

## 📁 **Estrutura do Projeto**

```
src/
├── app/                    # App Router (Next.js 14+)
│   ├── admin/             # Área administrativa
│   │   ├── posts/         # CRUD de posts
│   │   └── page.tsx       # Dashboard admin
│   ├── auth/              # Páginas de autenticação
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Navbar.tsx     # Navegação principal
│   │   ├── SearchBy.tsx   # Busca avançada
│   │   ├── Comments.tsx   # Sistema de comentários
│   │   └── ShareButton.tsx # Botão de compartilhar
│   ├── post/[slug]/       # Páginas de posts
│   ├── api/               # API Routes
│   │   ├── auth/          # Endpoints de autenticação
│   │   ├── upload/        # Upload de imagens
│   │   └── trpc/          # tRPC endpoints
│   └── layout.tsx         # Layout principal
├── server/                # Configuração do servidor
│   ├── api/               # Routers tRPC
│   │   ├── routers/       # Endpoints organizados
│   │   └── trpc.ts        # Configuração tRPC
│   └── db.ts             # Conexão com banco
├── lib/                   # Utilitários
│   ├── auth.ts           # Configuração de auth
│   └── utils.ts          # Funções auxiliares
├── styles/               # Estilos globais
│   ├── globals.css       # CSS global + Tailwind
│   └── markdown.css      # Estilos para markdown
└── prisma/               # Schema e migrations
    ├── schema.prisma     # Modelo do banco
    └── migrations/       # Histórico de mudanças
```

## 🎨 **Design System**

### **Cores Principais**
- **Primary**: `#667eea` (Azul moderno)
- **Secondary**: `#764ba2` (Roxo elegante)
- **Accent**: `#f093fb` (Rosa vibrante)

### **Tipografia**
- **Fonte Principal**: Lexend (Otimizada para leitura)
- **Fonte Código**: JetBrains Mono

### **Componentes**
- **Glass Cards**: Efeito de vidro com backdrop-blur
- **Gradient Text**: Textos com gradiente colorido
- **Hover Effects**: Animações suaves de interação

## 🚀 **Deploy**

### **Vercel (Recomendado)**
```bash
npm i -g vercel
vercel --prod
```

### **Docker**
```bash
docker build -t blog .
docker run -p 3000:3000 blog
```

## 🤝 **Contribuindo**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 **Roadmap**

- [ ] **Sistema de Newsletter** - Inscrição por email
- [ ] **Tags e Categorias** - Organização de conteúdo
- [ ] **RSS Feed** - Alimentação automática
- [ ] **PWA** - Aplicativo web progressivo
- [ ] **Multi-idioma** - Suporte i18n
- [ ] **Comments System** - Sistema nativo de comentários
- [ ] **Analytics Dashboard** - Métricas detalhadas

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 **Autor**

**Ruan Bueno**
- Website: [ruanbueno.cloud](https://ruanbueno.cloud)
- Blog: [blog.ruanbueno.cloud](https://blog.ruanbueno.cloud)
- LinkedIn: [linkedin.com/in/ruanbueno](https://linkedin.com/in/ruanbueno)
- GitHub: [@rbxyz](https://github.com/rbxyz)

---

<div align="center">

**⭐ Se este projeto te ajudou, deixe uma estrela!**

Feito com ☕ e Next.js por [Ruan Bueno](https://github.com/rbxyz)

</div>
