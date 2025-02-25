import { z } from "zod";
import { prisma } from "../../db";
import { publicProcedure, router } from "../trpc";
import slugify from "slugify";

export const postRouter = router({
  all: publicProcedure.query(async () => {
    try {
      console.log("📡 Recebida requisição para buscar posts...");
      return await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    } catch (error) {
      console.error("🔥 Erro ao buscar posts:", error);
      throw new Error("Erro ao buscar posts");
    }
  }),

  // 🔹 Novo endpoint para buscar o último post criado
  getLatest: publicProcedure.query(async () => {
    try {
      return await prisma.post.findFirst({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("🔥 Erro ao buscar o post mais recente:", error);
      throw new Error("Erro ao buscar post mais recente");
    }
  }),

  byId: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const post = await prisma.post.findUnique({
        where: { id: input },
      });

      if (!post) throw new Error("Post não encontrado");

      // Incrementa visualizações
      await prisma.post.update({
        where: { id: input },
        data: { viewCount: { increment: 1 } },
      });

      return post;
    } catch (error) {
      console.error("🔥 Erro ao buscar post:", error);
      throw new Error("Erro ao buscar post");
    }
  }),

  bySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      const post = await prisma.post.findUnique({
        where: { slug: input },
      });

      if (!post) throw new Error("Post não encontrado");

      await prisma.post.update({
        where: { slug: input },
        data: { viewCount: { increment: 1 } },
      });

      return post;
    } catch (error) {
      console.error("🔥 Erro ao buscar post:", error);
      throw new Error("Erro ao buscar post");
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(5),
        content: z.string().min(10),
        name: z.string().min(3),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const slug = slugify(input.title, { lower: true, strict: true });

        // Verifica se o slug já existe
        const existingPost = await prisma.post.findUnique({ where: { slug } });
        if (existingPost) throw new Error("Título já está em uso.");

        const newPost = await prisma.post.create({
          data: {
            title: input.title,
            content: input.content,
            name: input.name,
            createdAt: new Date(),
            slug,
            imageUrl: input.imageUrl,
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
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5),
        content: z.string().min(5),
        name: z.string().min(3),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const slug = slugify(input.title, { lower: true, strict: true });

        const updatedPost = await prisma.post.update({
          where: { id: input.id },
          data: {
            title: input.title,
            content: input.content,
            name: input.name,
            imageUrl: input.imageUrl,
            slug,
          },
        });

        console.log("📝 Post atualizado:", updatedPost);
        return updatedPost;
      } catch (error) {
        console.error("🔥 Erro ao atualizar post:", error);
        throw new Error("Erro ao atualizar post");
      }
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const deletedPost = await prisma.post.delete({ where: { id: input } });
      console.log("🗑️ Post excluído:", deletedPost);
      return deletedPost;
    } catch (error) {
      console.error("🔥 Erro ao deletar post:", error);
      throw new Error("Erro ao deletar post");
    }
  }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(3) }))
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

  recent: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }),

  mostRead: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      orderBy: { viewCount: "desc" },
      take: 5,
    });
  }),

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
