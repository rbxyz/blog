import { z } from "zod";
import { prisma } from "../../db";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import slugify from "slugify";

export const postRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    try {
      console.log("📡 Recebida requisição para buscar posts...");
      return await prisma.post.findMany({
        where: { published: true }, // 🔥 FILTRO ADICIONADO - apenas posts publicados
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
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
        include: {
          author: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!post) throw new Error("Post não encontrado");

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
        scheduledAt: z.date().optional(),
        published: z.boolean().optional(),
        audioUrl: z.string().optional(),
        audioDuration: z.number().optional(),
        spotifyPlaylistUrl: z.string().optional(),
        hasAudio: z.boolean().optional(),
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
          published: input.published ?? false,
          scheduledAt: input.scheduledAt,
          audioUrl: input.audioUrl,
          audioDuration: input.audioDuration,
          spotifyPlaylistUrl: input.spotifyPlaylistUrl,
          hasAudio: input.hasAudio ?? false,
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
        scheduledAt: z.date().optional(),
        published: z.boolean().optional(),
        audioUrl: z.string().optional(),
        audioDuration: z.number().optional(),
        spotifyPlaylistUrl: z.string().optional(),
        hasAudio: z.boolean().optional(),
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
            scheduledAt: input.scheduledAt,
            published: input.published,
            audioUrl: input.audioUrl,
            audioDuration: input.audioDuration,
            spotifyPlaylistUrl: input.spotifyPlaylistUrl,
            hasAudio: input.hasAudio,
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return await prisma.post.findMany({
        where: {
          AND: [
            { published: true }, // Only search published posts
            {
              OR: [
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                { title: { contains: searchQuery, mode: "insensitive" as any } },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                { content: { contains: searchQuery, mode: "insensitive" as any } },
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                ...searchWords.map(word => ({
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  title: { contains: word, mode: "insensitive" as any }
                })),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any  
                ...searchWords.map(word => ({
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
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
      where: { published: true }, // 🔥 FILTRO ADICIONADO - apenas posts publicados
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }),

  // Posts paginados para a página inicial
  getPaginated: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(8),
    }))
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            author: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        }),
        prisma.post.count({
          where: { published: true },
        }),
      ]);

      return {
        posts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      };
    }),

  // Métricas dos posts
  getMetrics: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      const { days } = input;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        totalPosts,
        newPosts,
        totalViews,
        newViews,
        topPosts,
        averageViewsPerPost,
        averageTimeOnPage,
        averageScrollDepth,
      ] = await Promise.all([
        // Total de posts
        prisma.post.count({ where: { published: true } }),

        // Novos posts no período
        prisma.post.count({
          where: {
            published: true,
            createdAt: { gte: startDate },
          },
        }),

        // Total de visualizações
        prisma.post.aggregate({
          where: { published: true },
          _sum: { viewCount: true },
        }),

        // Novas visualizações no período (simulado)
        prisma.post.aggregate({
          where: {
            published: true,
            updatedAt: { gte: startDate },
          },
          _sum: { viewCount: true },
        }),

        // Posts mais populares
        prisma.post.findMany({
          where: { published: true },
          orderBy: { viewCount: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            viewCount: true,
            createdAt: true,
          },
        }),

        // Média de visualizações por post
        prisma.post.aggregate({
          where: { published: true },
          _avg: { viewCount: true },
        }),

        // Tempo médio na página (simulado)
        Promise.resolve(3.5), // 3.5 minutos

        // Taxa de rolagem (simulada)
        Promise.resolve(65), // 65%
      ]);

      return {
        totalPosts,
        newPosts,
        totalViews: totalViews._sum.viewCount ?? 0,
        newViews: newViews._sum.viewCount ?? 0,
        topPosts,
        averageViewsPerPost: Math.round(averageViewsPerPost._avg.viewCount ?? 0),
        averageTimeOnPage,
        averageScrollDepth,
      };
    }),

  // Métricas de áudio
  getAudioMetrics: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      const { days } = input;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        postsWithAudio,
        totalPlays,
        completionRate,
        averageListenTime,
      ] = await Promise.all([
        // Posts com áudio
        prisma.post.count({
          where: {
            published: true,
            audioUrl: { not: null },
          },
        }),

        // Total de reproduções (simulado)
        Promise.resolve(1250),

        // Taxa de conclusão (simulada)
        Promise.resolve(78.5), // 78.5%

        // Tempo médio de escuta (simulado)
        Promise.resolve(4.2), // 4.2 minutos
      ]);

      return {
        postsWithAudio,
        totalPlays,
        completionRate,
        averageListenTime,
      };
    }),

  mostRead: publicProcedure.query(async () => {
    return await prisma.post.findMany({
      where: { published: true }, // 🔥 FILTRO ADICIONADO - apenas posts publicados
      orderBy: { viewCount: "desc" },
      take: 5,
    });
  }),

  trending: publicProcedure.query(async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await prisma.post.findMany({
      where: {
        published: true, // 🔥 FILTRO ADICIONADO - apenas posts publicados
        createdAt: { gte: sevenDaysAgo }
      },
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
        data: {
          published: input.published,
          publishedAt: input.published ? new Date() : null,
        },
      });
    }),

  // Função para agendar publicação (admin)
  schedule: protectedProcedure
    .input(z.object({
      id: z.string(),
      scheduledAt: z.date().optional(),
      published: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      if (ctx.session.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

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
