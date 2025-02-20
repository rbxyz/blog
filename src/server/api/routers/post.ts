import { z } from 'zod';
import { prisma } from '../../db';
import { publicProcedure, router } from "../trpc";
import slugify from 'slugify';

// Mapeamento fixo das categorias
const fixedCategories: Record<string, string> = {
  "novidades": "Novidades",
  "novos-projetos": "Novos Projetos",
  "blog": "Blog",
};
export const postRouter = router({
  // Query para buscar todos os posts
  all: publicProcedure.query(async () => {
    try {
      console.log("📡 Recebida requisição para buscar posts...");
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
      });
      return posts || [];
    } catch (error) {
      console.error("🔥 Erro ao buscar posts no banco:", error);
      throw new Error("Erro ao buscar posts");
    }
  }),

  // Query para buscar um post específico pelo ID
  byId: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const post = await prisma.post.findUnique({
          where: { id: input },
          include: { category: true },
        });
        if (!post) throw new Error("Post não encontrado");
        return post;
      } catch (error) {
        console.error("🔥 Erro ao buscar post:", error);
        throw new Error("Erro ao buscar post");
      }
    }),

    bySlug: publicProcedure
  .input(z.string())
  .query(async ({ input }) => {
    try {
      const post = await prisma.post.findUnique({
        where: { slug: input }, 
        include: { category: true },
      });

      if (!post) throw new Error("Post não encontrado");
      return post;
    } catch (error) {
      console.error("🔥 Erro ao buscar post:", error);
      throw new Error("Erro ao buscar post");
    }
  }),


  // Query para buscar o post mais recente
  getLatest: publicProcedure.query(async () => {
    return await prisma.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }), 
  
  // Mutation para criar um novo post (gera o slug automaticamente e conecta categoria, se fornecida)
  create: publicProcedure
  .input(z.object({
    title: z.string().min(5),
    content: z.string().min(10),
    name: z.string().min(3),
    imageUrl: z.string().optional(),
    categoryId: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const slug = slugify(input.title, { lower: true, strict: true });
      
      const newPost = await prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          name: input.name,
          createdAt: new Date(),
          slug: slug,
          imageUrl: input.imageUrl,
          category: input.categoryId 
            ? { 
                connectOrCreate: { 
                  where: { id: input.categoryId }, 
                  create: { name: fixedCategories[input.categoryId]! } 
                } 
              }
            : undefined,
        },
      });
      console.log("📑 Novo post criado:", newPost);
      return newPost;
    } catch (error) {
      console.error("🔥 Erro ao criar post:", error);
      throw new Error("Erro ao criar post");
    }
  }),

update: publicProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().min(5),
    content: z.string().min(10),
    name: z.string().min(3),
    imageUrl: z.string().optional(),
    categoryId: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const updatedPost = await prisma.post.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          name: input.name,
          imageUrl: input.imageUrl,
          category: input.categoryId 
            ? { 
                connectOrCreate: { 
                  where: { id: input.categoryId }, 
                  create: { name: fixedCategories[input.categoryId]! } 
                } 
              }
            : undefined,
        },
      });
      console.log("📝 Post atualizado:", updatedPost);
      return updatedPost;
    } catch (error) {
      console.error("🔥 Erro ao atualizar post:", error);
      throw new Error("Erro ao atualizar post");
    }
  }),

  // Mutation para deletar um post pelo ID
  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const deletedPost = await prisma.post.delete({
          where: { id: input },
        });
        console.log("🗑️ Post excluído:", deletedPost);
        return deletedPost;
      } catch (error) {
        console.error("🔥 Erro ao deletar post:", error);
        throw new Error("Erro ao deletar post");
      }
    }),

  // Query para buscar posts de acordo com uma busca
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { content: { contains: input.query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Query para posts recentes (os 5 mais recentes)
  recent: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }),

  // Query para posts mais lidos (baseado em viewCount)
  mostRead: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      orderBy: { viewCount: "desc" },
      take: 5,
    });
  }),

  // Query para posts em alta (ex: posts dos últimos 7 dias ordenados por viewCount)
  trending: publicProcedure.query(async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return await prisma.post.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { viewCount: "desc" },
      take: 5,
    });
  }),
});
