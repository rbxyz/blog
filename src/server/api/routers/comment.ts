import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
    // Buscar comentários de um post
    getByPostId: publicProcedure
        .input(z.object({ postId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.comment.findMany({
                where: {
                    postId: input.postId,
                    isDeleted: false,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }),

    // Criar comentário (requer autenticação)
    create: protectedProcedure
        .input(
            z.object({
                content: z.string().min(1, "Comentário não pode estar vazio").max(500, "Comentário muito longo"),
                postId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.comment.create({
                data: {
                    content: input.content,
                    postId: input.postId,
                    authorId: ctx.session.id,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            });
        }),

    // Editar comentário (só autor ou admin)
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                content: z.string().min(1, "Comentário não pode estar vazio").max(500, "Comentário muito longo"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.db.comment.findUnique({
                where: { id: input.id },
                select: { authorId: true },
            });

            if (!comment) {
                throw new Error("Comentário não encontrado");
            }

            // Verificar se é o autor ou admin
            const isAuthor = comment.authorId === ctx.session.id;
            const isAdmin = ctx.session.role === "ADMIN";

            if (!isAuthor && !isAdmin) {
                throw new Error("Você não tem permissão para editar este comentário");
            }

            return ctx.db.comment.update({
                where: { id: input.id },
                data: { content: input.content },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            });
        }),

    // Deletar comentário (só autor ou admin)
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.db.comment.findUnique({
                where: { id: input.id },
                select: { authorId: true },
            });

            if (!comment) {
                throw new Error("Comentário não encontrado");
            }

            // Verificar se é o autor ou admin
            const isAuthor = comment.authorId === ctx.session.id;
            const isAdmin = ctx.session.role === "ADMIN";

            if (!isAuthor && !isAdmin) {
                throw new Error("Você não tem permissão para deletar este comentário");
            }

            // Soft delete - marcar como deletado
            return ctx.db.comment.update({
                where: { id: input.id },
                data: { isDeleted: true },
            });
        }),

    // Listar todos os comentários (para admin)
    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            // Verificar se é admin
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            return ctx.db.comment.findMany({
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    post: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }),

    // Restaurar comentário deletado (admin only)
    restore: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verificar se é admin
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            return ctx.db.comment.update({
                where: { id: input.id },
                data: { isDeleted: false },
            });
        }),
}); 