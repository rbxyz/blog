import { z } from 'zod';
import { prisma } from '../../db';
import { publicProcedure, router } from "../trpc";
import slugify from 'slugify'; // Certifique-se de importar o slugify
import { Prisma } from '@prisma/client';

export const postRouter = router({
  // Rota para buscar todos os posts
  all: publicProcedure.query(async () => {
    try {
      console.log("📡 Recebida requisição para buscar posts...");

      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: "desc", // ordena por data de criação
        }
      });

      if (!posts) {
        console.error("⚠️ Nenhum post encontrado! Retornando um array vazio.");
        return [];
      }

      return posts;
    } catch (error) {
      console.error("🔥 Erro ao buscar posts no banco:", error);
      throw new Error("Erro ao buscar posts");
    }
  }),

  // Rota para buscar um post específico pelo ID
  byId: publicProcedure
    .input(z.string()) // Aceita o id diretamente como string
    .query(async ({ input }) => {
      try {
        const post = await prisma.post.findUnique({
          where: { id: input }, // Usa o id diretamente
        });

        if (!post) {
          throw new Error("Post não encontrado");
        }

        return post;
      } catch (error) {
        console.error("🔥 Erro ao buscar post:", error);
        throw new Error("Erro ao buscar post");
      }
    }),

  // ✅ Correção: Usar `prisma` diretamente ao invés de `ctx.db`
  getLatest: publicProcedure.query(async () => {
    return await prisma.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  // Rota para criar um novo post
  create: publicProcedure
    .input(z.object({
      title: z.string().min(5),
      content: z.string().min(10),
      name: z.string().min(3),
    })) // Validação dos campos
    .mutation(async ({ input }) => {
      try {
        // Gerar o slug com base no título
        const slug = slugify(input.title, { lower: true, strict: true });

        const newPost = await prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            name: input.name,
            createdAt: new Date(),
            slug: slug,  // Adiciona o slug
          } as Prisma.PostCreateInput,  // Especificando o tipo de entrada correto para Prisma
        });

        console.log("📑 Novo post criado:", newPost);
        return newPost;
      } catch (error) {
        console.error("🔥 Erro ao criar post:", error);
        throw new Error("Erro ao criar post");
      }
    }),
});
