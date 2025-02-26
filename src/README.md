# 📌 Documentação do Projeto `blog`

## **Versão 1 (V1) – Estrutura Inicial**

### Recursos Implementados

- **Banco de Dados e Modelo de Posts**

  - Criação da tabela `Post` com os seguintes campos:
    - `id`: Identificador único (UUID ou cuid).
    - `name`: Nome do autor do post.
    - `title`: Título do post.
    - `content`: Conteúdo do post.
    - `slug`: Identificador único (URLs amigáveis) gerado automaticamente a partir do título.
    - `imageUrl`: URL da imagem associada ao post (opcional).
    - `viewCount`: Contador de visualizações (padrão `0`).
    - `createdAt`: Data de criação do post.
    - `categoryId`: Campo para relacionamento opcional com a tabela `Category`.

- **Sistema de CRUD para Posts**

  - Criação, atualização, deleção e listagem de posts.
  - Listagem ordenada por data de criação (posts mais recentes primeiro).
  - Busca de posts por ID (posteriormente aprimorada para incluir busca por slug e palavras-chave).

- **Implementação Inicial de Categorias**
  - Criação do modelo `Category` com os campos:
    - `id`: Identificador único (UUID ou cuid).
    - `name`: Nome da categoria (único).
  - Relacionamento: Cada post pode pertencer a uma categoria (campo opcional).
  - Listagem de posts por categoria (a lógica inicial foi esboçada).

---

## **Versão 2 (V2) – Melhorias e Novos Recursos**

### Alterações no Banco de Dados

- **Atualização do Modelo de Posts**

  - Inclusão e uso do campo `slug` para URLs amigáveis.
  - Inclusão do relacionamento com `Category` via o campo `categoryId`.
  - Adição do campo `imageUrl` para associar imagens aos posts.
  - Introdução do campo `viewCount` para futuras métricas de popularidade.

- **Sistema de Categorias Avançado**
  - Implementação de categorias fixas:
    - `"novidades"`,
    - `"novos-projetos"`,
    - `"blog"`.
  - No backend, na criação e atualização de posts, foi implementado o recurso de **connectOrCreate** para vincular automaticamente a categoria fixa – se o post enviar um `categoryId`, o sistema conecta à categoria existente ou a cria se não existir.

### Novos Recursos e Melhorias no Backend

- **Busca Aprimorada**

  - Pesquisa por palavras-chave no título e conteúdo dos posts (modo insensível a maiúsculas/minúsculas).
  - Rotas de consulta para:
    - Posts recentes (últimos 5),
    - Posts mais lidos (ordenados por `viewCount`),
    - Posts em alta (posts dos últimos 7 dias, ordenados por `viewCount`).

- **Tratamento de Erros e Logging**

  - Mensagens de log aprimoradas para depuração (ex.: "📡 Recebida requisição para buscar posts...", "🔥 Erro ao criar post", etc.).
  - Tratamento robusto dos erros em cada operação de CRUD.

- **Upload de Imagens**
  - Implementação de um endpoint de upload de imagens que salva arquivos localmente na pasta `public/upload`.
  - O endpoint utiliza o método nativo `req.formData()` do Next.js para processar uploads multipart, convertendo o arquivo para buffer e salvando-o com um nome único.
  - Retorno da URL relativa da imagem para ser armazenada no post.

### Melhorias no Frontend

- **Home Page (Lista de Posts)**

  - Exibição dos posts em três seções:
    - Notícias Recentes,
    - Notícias Mais Lidas,
    - Notícias em Alta.
  - Cada post é exibido com imagem (quando presente), título, trecho do conteúdo e links clicáveis (usando o `slug`).
  - As categorias são listadas na parte superior como botões clicáveis que permitem filtrar os posts por categoria (rota `/categoria/[id]`).

- **Página do Post Dinâmico**

  - Implementação da rota dinâmica baseada no `slug` (em `src/app/post/[slug]/page.tsx`).
  - Utiliza a função `generateStaticParams()` para gerar as páginas estaticamente com base nos slugs dos posts.
  - Exibe a imagem do post em destaque (resolução 1080 x 720), título, conteúdo, autor, data e categoria (com botão para filtrar).

- **Painel de Administração (Admin)**

  - Criação de uma página de administração para gerenciar posts (criar, atualizar e excluir).
  - Formulário com campos para título, conteúdo, autor, seleção de categoria (usando as categorias fixas) e upload de imagem.
  - Lista de posts com botões para editar e excluir. Ao clicar em "Editar", os dados do post são carregados no formulário.
  - Utiliza as mutations do tRPC para as operações de criação, atualização e deleção, e atualiza a lista de posts dinamicamente.

- **Navbar e Integração com Clerk**
  - Implementação de uma Navbar que inclui links para Home, Admin e exibe o ícone do usuário.
  - O `ClerkProvider` foi movido para o nível superior (no layout) para envolver toda a aplicação, garantindo a autenticação adequada.
  - O componente `UserButton` do Clerk aparece na Navbar, permitindo acesso rápido ao perfil do usuário.

---

## **Próximos Passos**

Com essa base consolidada, os próximos passos poderão incluir:

- Implementar a funcionalidade de filtragem de posts por categoria (exibindo páginas específicas para cada categoria).
- Aprimorar a pesquisa ("SearchBy") para buscar posts conforme o termo digitado.
- Expandir a funcionalidade do CRUD no painel de administração (incluindo edições avançadas, paginação, etc.).
- (Opcional) Integrar autenticação avançada com Clerk, conforme necessário para proteger áreas administrativas.

---

Esta documentação reflete as mudanças da V1 e V2, incluindo as melhorias de backend, frontend e o sistema de upload de imagens e categorias. Se precisar de mais ajustes ou esclarecimentos, estou à disposição!
