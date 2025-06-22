import { z } from "zod";
import { prisma } from "../../db";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import slugify from "slugify";

export const postRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      console.log("📡 Recebida requisição para buscar posts...");
      return await prisma.post.findMany({
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

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5),
        content: z.string().min(10),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("🔍 Dados recebidos para criar post:", {
        input,
        session: {
          id: ctx.session.id,
          email: ctx.session.email,
          role: ctx.session.role
        }
      });

      // Verificar se é o email autorizado ou ADMIN
      if (ctx.session.email !== 'rbcr4z1@gmail.com' && ctx.session.role !== 'ADMIN') {
        console.error("❌ Usuário não autorizado:", {
          email: ctx.session.email,
          role: ctx.session.role
        });
        throw new Error("Apenas o administrador pode criar posts");
      }

      try {
        const slug = slugify(input.title, { lower: true, strict: true });
        console.log("🔗 Slug gerado:", slug);

        // Verifica se o slug já existe
        const existingPost = await prisma.post.findUnique({ where: { slug } });
        if (existingPost) {
          console.error("❌ Slug já existe:", slug);
          throw new Error("Título já está em uso.");
        }

        const postData = {
          title: input.title,
          content: input.content,
          slug,
          imageUrl: input.imageUrl,
          authorId: ctx.session.id,
          published: false,
        };

        console.log("💾 Criando post no banco:", postData);

        const newPost = await prisma.post.create({
          data: postData,
        });

        console.log("✅ Post criado com sucesso:", newPost);
        return newPost;
      } catch (error) {
        console.error("🔥 Erro detalhado ao criar post:", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          input,
          session: ctx.session
        });

        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error("Erro desconhecido ao criar post");
        }
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(5),
        content: z.string().min(5),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é o email autorizado para editar posts
      if (ctx.session.email !== 'rbcr4z1@gmail.com') {
        throw new Error("Apenas o administrador pode editar posts");
      }
      try {
        const slug = slugify(input.title, { lower: true, strict: true });

        const updatedPost = await prisma.post.update({
          where: { id: input.id },
          data: {
            title: input.title,
            content: input.content,
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.session.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      return ctx.db.post.delete({
        where: { id: input.id },
      });
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(3) }))
    .query(async ({ input }) => {
      const searchQuery = input.query.trim();

      // Split query into words for better matching
      const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 2);

      return await prisma.post.findMany({
        where: {
          AND: [
            { published: true }, // Only search published posts
            {
              OR: [
                // Exact phrase match in title (highest priority)
                { title: { contains: searchQuery, mode: "insensitive" as any } },
                // Exact phrase match in content
                { content: { contains: searchQuery, mode: "insensitive" as any } },
                // Individual word matches in title
                ...searchWords.map(word => ({
                  title: { contains: word, mode: "insensitive" as any }
                })),
                // Individual word matches in content
                ...searchWords.map(word => ({
                  content: { contains: word, mode: "insensitive" as any }
                })),
              ],
            },
          ],
        },
        orderBy: [
          // Order by relevance - title matches first, then by creation date
          { createdAt: "desc" }
        ],
        take: 10, // Limit results
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

  // Função para listar todos os posts (admin)
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      // Verificar se é admin
      if (ctx.session.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      return ctx.db.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  // Função para alternar publicação (admin)
  togglePublished: protectedProcedure
    .input(z.object({
      id: z.string(),
      published: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.session.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      return ctx.db.post.update({
        where: { id: input.id },
        data: { published: input.published },
      });
    }),
});
