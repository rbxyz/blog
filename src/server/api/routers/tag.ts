import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const tagRouter = createTRPCRouter({
    // Buscar todas as tags
    getAll: publicProcedure.query(async ({ ctx }) => {
        return await ctx.db.tag.findMany({
            orderBy: { viewCount: "desc" },
        });
    }),

    // Buscar tags populares
    getPopular: publicProcedure
        .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.tag.findMany({
                take: input.limit,
                orderBy: { viewCount: "desc" },
            });
        }),

    // Buscar posts por tag
    getPostsByTag: publicProcedure
        .input(z.object({
            tagSlug: z.string(),
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(50).default(8)
        }))
        .query(async ({ ctx, input }) => {
            const offset = (input.page - 1) * input.limit;

            const tag = await ctx.db.tag.findUnique({
                where: { slug: input.tagSlug },
                include: {
                    posts: {
                        include: {
                            post: {
                                include: {
                                    author: true,
                                    tags: {
                                        include: {
                                            tag: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!tag) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Tag não encontrada",
                });
            }

            // Incrementar contador de visualizações da tag
            await ctx.db.tag.update({
                where: { id: tag.id },
                data: { viewCount: { increment: 1 } },
            });

            const posts = tag.posts
                .map((pt) => pt.post)
                .filter((post) => post.published)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const total = posts.length;
            const paginatedPosts = posts.slice(offset, offset + input.limit);
            const hasMore = offset + input.limit < total;

            return {
                tag,
                posts: paginatedPosts,
                total,
                hasMore,
                currentPage: input.page,
            };
        }),

    // Criar nova tag (admin)
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).max(50),
                description: z.string().optional(),
                color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verificar se é admin
            if (ctx.session.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Apenas administradores podem criar tags",
                });
            }

            const slug = input.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();

            // Verificar se já existe uma tag com este slug
            const existingTag = await ctx.db.tag.findUnique({
                where: { slug },
            });

            if (existingTag) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Já existe uma tag com este nome",
                });
            }

            return await ctx.db.tag.create({
                data: {
                    name: input.name,
                    slug,
                    description: input.description,
                    color: input.color,
                },
            });
        }),

    // Atualizar tag (admin)
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).max(50).optional(),
                description: z.string().optional(),
                color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verificar se é admin
            if (ctx.session.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Apenas administradores podem editar tags",
                });
            }

            const updateData: Record<string, unknown> = {};
            if (input.name) {
                updateData.name = input.name;
                updateData.slug = input.name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                    .trim();
            }
            if (input.description !== undefined) updateData.description = input.description;
            if (input.color !== undefined) updateData.color = input.color;

            return await ctx.db.tag.update({
                where: { id: input.id },
                data: updateData,
            });
        }),

    // Deletar tag (admin)
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verificar se é admin
            if (ctx.session.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Apenas administradores podem deletar tags",
                });
            }

            return await ctx.db.tag.delete({
                where: { id: input.id },
            });
        }),

    // Adicionar tags a um post
    addToPost: protectedProcedure
        .input(
            z.object({
                postId: z.string(),
                tagIds: z.array(z.string()),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Verificar se o usuário é o autor do post ou admin
            const post = await ctx.db.post.findUnique({
                where: { id: input.postId },
                include: { author: true },
            });

            if (!post) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Post não encontrado",
                });
            }

            if (post.authorId !== ctx.session.id && ctx.session.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Você não tem permissão para editar este post",
                });
            }

            // Remover tags existentes
            await ctx.db.postTag.deleteMany({
                where: { postId: input.postId },
            });

            // Adicionar novas tags
            const postTags = await Promise.all(
                input.tagIds.map((tagId) =>
                    ctx.db.postTag.create({
                        data: {
                            postId: input.postId,
                            tagId,
                        },
                    })
                )
            );

            return postTags;
        }),

    // Buscar tags de um post
    getByPost: publicProcedure
        .input(z.object({ postId: z.string() }))
        .query(async ({ ctx, input }) => {
            const postTags = await ctx.db.postTag.findMany({
                where: { postId: input.postId },
                include: { tag: true },
            });

            return postTags.map((pt) => pt.tag);
        }),

    // Buscar tags por nome (para autocomplete)
    search: publicProcedure
        .input(z.object({ query: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.tag.findMany({
                where: {
                    name: {
                        contains: input.query,
                        mode: "insensitive",
                    },
                },
                take: 10,
                orderBy: { viewCount: "desc" },
            });
        }),

    // Métricas de tags
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
        // Verificar se é admin
        if (ctx.session.role !== "ADMIN") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Apenas administradores podem ver métricas",
            });
        }

        const totalTags = await ctx.db.tag.count();
        const popularTags = await ctx.db.tag.findMany({
            take: 10,
            orderBy: { viewCount: "desc" },
            select: {
                name: true,
                viewCount: true,
                _count: {
                    select: { posts: true },
                },
            },
        });

        const tagsWithPostCount = await ctx.db.tag.findMany({
            select: {
                name: true,
                _count: {
                    select: { posts: true },
                },
            },
            orderBy: { viewCount: "desc" },
            take: 10,
        });

        return {
            totalTags,
            popularTags,
            tagsWithPostCount,
        };
    }),
}); 