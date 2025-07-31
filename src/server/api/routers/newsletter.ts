import { z } from "zod";
import { prisma } from "../../db";
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { emailService } from "~/lib/email";
import { queueService } from "~/lib/queue";
import { templateService } from "~/lib/templates";

// Definir enums localmente para evitar problemas de import
enum EmailType {
    WELCOME = "WELCOME",
    NEWSLETTER = "NEWSLETTER",
    CONFIRMATION = "CONFIRMATION"
}

enum EmailStatus {
    SENT = "SENT",
    FAILED = "FAILED",
    OPENED = "OPENED",
    CLICKED = "CLICKED"
}

export const newsletterRouter = createTRPCRouter({
    // Inscrição na newsletter
    subscribe: publicProcedure
        .input(
            z.object({
                email: z.string().email("E-mail inválido"),
                name: z.string().optional(),
                source: z.string().optional(),
                metadata: z.record(z.unknown()).optional(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                // Verificar se já existe inscrição
                const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
                    where: { email: input.email },
                });

                if (existingSubscriber) {
                    if (existingSubscriber.isActive) {
                        return { success: false, message: "E-mail já está inscrito na newsletter" };
                    } else {
                        // Reativar inscrição
                        await prisma.newsletterSubscriber.update({
                            where: { id: existingSubscriber.id },
                            data: {
                                isActive: true,
                                unsubscribedAt: null,
                                name: input.name,
                                source: input.source,
                                metadata: input.metadata as unknown as any,
                            },
                        });
                        return { success: true, message: "Inscrição reativada com sucesso" };
                    }
                }

                // Criar nova inscrição
                const subscriber = await prisma.newsletterSubscriber.create({
                    data: {
                        email: input.email,
                        name: input.name,
                        source: input.source,
                        metadata: input.metadata as unknown as any,
                    },
                });

                // Enviar email de boas-vindas
                try {
                    await emailService.initialize();
                    const welcomeHTML = emailService.generateWelcomeHTML(input.name);

                    const emailSent = await emailService.sendEmail({
                        to: input.email,
                        subject: "Bem-vindo à Newsletter do Tech & Marketing & Business!",
                        html: welcomeHTML,
                    });

                    if (emailSent) {
                        await emailService.logEmail(
                            subscriber.id,
                            EmailType.WELCOME,
                            EmailStatus.SENT
                        );
                    }
                } catch (error) {
                    console.error("Erro ao enviar email de boas-vindas:", error);
                }

                return { success: true, message: "Inscrito na newsletter com sucesso" };
            } catch (error) {
                console.error("Erro ao inscrever na newsletter:", error);
                return { success: false, message: "Erro ao processar inscrição" };
            }
        }),

    // Cancelar inscrição
    unsubscribe: publicProcedure
        .input(z.object({ email: z.string().email("E-mail inválido") }))
        .mutation(async ({ input }) => {
            try {
                const subscriber = await prisma.newsletterSubscriber.findUnique({
                    where: { email: input.email },
                });

                if (!subscriber) {
                    return { success: false, message: "E-mail não encontrado" };
                }

                await prisma.newsletterSubscriber.update({
                    where: { id: subscriber.id },
                    data: {
                        isActive: false,
                        unsubscribedAt: new Date(),
                    },
                });

                return { success: true, message: "Inscrição cancelada com sucesso" };
            } catch (error) {
                console.error("Erro ao cancelar inscrição:", error);
                return { success: false, message: "Erro ao cancelar inscrição" };
            }
        }),

    // Listar inscritos (admin)
    getSubscribers: protectedProcedure
        .input(
            z.object({
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(100).default(20),
                search: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            const skip = (input.page - 1) * input.limit;
            const where = input.search
                ? {
                    OR: [
                        { email: { contains: input.search, mode: "insensitive" as const } },
                        { name: { contains: input.search, mode: "insensitive" as const } },
                    ],
                }
                : {};

            const [subscribers, total] = await Promise.all([
                prisma.newsletterSubscriber.findMany({
                    where,
                    orderBy: { subscribedAt: "desc" },
                    skip,
                    take: input.limit,
                    include: {
                        _count: {
                            select: { emailLogs: true },
                        },
                    },
                }),
                prisma.newsletterSubscriber.count({ where }),
            ]);

            return {
                subscribers,
                total,
                pages: Math.ceil(total / input.limit),
                currentPage: input.page,
            };
        }),

    // Estatísticas da newsletter (admin)
    getStats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.role !== "ADMIN") {
            throw new Error("Acesso negado");
        }

        const [
            totalSubscribers,
            activeSubscribers,
            unsubscribedCount,
            totalEmailsSent,
            emailsOpened,
            emailsClicked,
        ] = await Promise.all([
            prisma.newsletterSubscriber.count(),
            prisma.newsletterSubscriber.count({ where: { isActive: true } }),
            prisma.newsletterSubscriber.count({ where: { isActive: false } }),
            prisma.newsletterEmailLog.count({ where: { status: EmailStatus.SENT } }),
            prisma.newsletterEmailLog.count({ where: { status: EmailStatus.OPENED } }),
            prisma.newsletterEmailLog.count({ where: { status: EmailStatus.CLICKED } }),
        ]);

        // Estatísticas dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            newSubscribers30d,
            emailsSent30d,
            emailsOpened30d,
        ] = await Promise.all([
            prisma.newsletterSubscriber.count({
                where: { subscribedAt: { gte: thirtyDaysAgo } },
            }),
            prisma.newsletterEmailLog.count({
                where: {
                    status: EmailStatus.SENT,
                    sentAt: { gte: thirtyDaysAgo },
                },
            }),
            prisma.newsletterEmailLog.count({
                where: {
                    status: EmailStatus.OPENED,
                    openedAt: { gte: thirtyDaysAgo },
                },
            }),
        ]);

        return {
            totalSubscribers,
            activeSubscribers,
            unsubscribedCount,
            totalEmailsSent,
            emailsOpened,
            emailsClicked,
            openRate: totalEmailsSent > 0 ? (emailsOpened / totalEmailsSent) * 100 : 0,
            clickRate: totalEmailsSent > 0 ? (emailsClicked / totalEmailsSent) * 100 : 0,
            last30Days: {
                newSubscribers: newSubscribers30d,
                emailsSent: emailsSent30d,
                emailsOpened: emailsOpened30d,
            },
        };
    }),

    // Configurações SMTP (admin)
    getSmtpConfig: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.role !== "ADMIN") {
            throw new Error("Acesso negado");
        }

        const config = await prisma.smtpConfig.findFirst({
            orderBy: { updatedAt: "desc" },
        });

        return config;
    }),

    updateSmtpConfig: protectedProcedure
        .input(
            z.object({
                host: z.string().min(1),
                port: z.number().min(1).max(65535),
                secure: z.boolean(),
                username: z.string().min(1),
                password: z.string().min(1),
                fromEmail: z.string().email(),
                fromName: z.string().min(1),
                isActive: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                // Se está ativando, desativar outras configurações
                if (input.isActive) {
                    await prisma.smtpConfig.updateMany({
                        where: { isActive: true },
                        data: { isActive: false },
                    });
                }

                const config = await prisma.smtpConfig.upsert({
                    where: { id: "default" },
                    update: input,
                    create: {
                        id: "default",
                        ...input,
                    },
                });

                return { success: true, config };
            } catch (error) {
                console.error("Erro ao atualizar configuração SMTP:", error);
                return { success: false, message: "Erro ao atualizar configuração" };
            }
        }),

    // Enviar newsletter manual (admin)
    sendNewsletter: protectedProcedure
        .input(z.object({ postId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const post = await prisma.post.findUnique({
                    where: { id: input.postId },
                    include: { author: true },
                });

                if (!post) {
                    throw new Error("Post não encontrado");
                }

                const subscribers = await prisma.newsletterSubscriber.findMany({
                    where: { isActive: true },
                });

                if (subscribers.length === 0) {
                    return { success: false, message: "Nenhum inscrito ativo encontrado" };
                }

                await emailService.initialize();

                const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
                const postUrl = `${baseUrl}/post/${post.slug}`;

                let successCount = 0;
                let errorCount = 0;

                for (const subscriber of subscribers) {
                    try {
                        const newsletterData = {
                            postTitle: post.title,
                            postContent: post.content,
                            postImageUrl: post.imageUrl ?? undefined,
                            postUrl,
                            authorName: post.author.name ?? post.author.email,
                            unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
                        };

                        const html = emailService.generateNewsletterHTML(newsletterData);

                        const emailSent = await emailService.sendEmail({
                            to: subscriber.email,
                            subject: `📝 ${post.title} - Tech & Marketing & Business`,
                            html,
                        });

                        if (emailSent) {
                            await emailService.logEmail(
                                subscriber.id,
                                EmailType.NEWSLETTER,
                                EmailStatus.SENT,
                                post.id
                            );
                            successCount++;
                        } else {
                            await emailService.logEmail(
                                subscriber.id,
                                EmailType.NEWSLETTER,
                                EmailStatus.FAILED,
                                post.id,
                                "Falha no envio"
                            );
                            errorCount++;
                        }
                    } catch (error) {
                        console.error(`Erro ao enviar email para ${subscriber.email}:`, error);
                        await emailService.logEmail(
                            subscriber.id,
                            EmailType.NEWSLETTER,
                            EmailStatus.FAILED,
                            post.id,
                            error instanceof Error ? error.message : "Erro desconhecido"
                        );
                        errorCount++;
                    }
                }

                return {
                    success: true,
                    message: `Newsletter enviada: ${successCount} sucessos, ${errorCount} erros`,
                    stats: { successCount, errorCount, total: subscribers.length },
                };
            } catch (error) {
                console.error("Erro ao enviar newsletter:", error);
                return { success: false, message: "Erro ao enviar newsletter" };
            }
        }),

    // Gerar HTML da newsletter (admin)
    generateNewsletterHTML: protectedProcedure
        .input(z.object({ postId: z.string() }))
        .query(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const post = await prisma.post.findUnique({
                    where: { id: input.postId },
                    include: { author: true },
                });

                if (!post) {
                    throw new Error("Post não encontrado");
                }

                const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
                const postUrl = `${baseUrl}/post/${post.slug}`;

                const newsletterData = {
                    postTitle: post.title,
                    postContent: post.content,
                    postImageUrl: post.imageUrl ?? undefined,
                    postUrl,
                    authorName: post.author.name ?? post.author.email,
                    unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?email=example@email.com`,
                };

                const html = emailService.generateNewsletterHTML(newsletterData);

                return { success: true, html };
            } catch (error) {
                console.error("Erro ao gerar HTML da newsletter:", error);
                return { success: false, message: "Erro ao gerar HTML" };
            }
        }),

    // ===== SISTEMA DE FILAS =====

    // Adicionar newsletter na fila
    addToQueue: protectedProcedure
        .input(z.object({ postId: z.string(), priority: z.number().min(0).max(10).default(0) }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const queueId = await queueService.addNewsletterToQueue(input.postId, input.priority);
                return { success: true, queueId };
            } catch (error) {
                console.error("Erro ao adicionar na fila:", error);
                return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
            }
        }),

    // Status da fila
    getQueueStatus: protectedProcedure
        .input(z.object({ queueId: z.string() }))
        .query(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            const queue = await queueService.getQueueStatus(input.queueId);
            return queue;
        }),

    // Cancelar fila
    cancelQueue: protectedProcedure
        .input(z.object({ queueId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            const success = await queueService.cancelQueue(input.queueId);
            return { success };
        }),

    // Estatísticas da fila
    getQueueStats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.role !== "ADMIN") {
            throw new Error("Acesso negado");
        }

        return await queueService.getQueueStats();
    }),

    // ===== SISTEMA DE TEMPLATES =====

    // Listar templates
    getTemplates: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.role !== "ADMIN") {
            throw new Error("Acesso negado");
        }

        return await templateService.getTemplates();
    }),

    // Buscar template específico
    getTemplate: protectedProcedure
        .input(z.object({ templateId: z.string() }))
        .query(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            return await templateService.getTemplate(input.templateId);
        }),

    // Criar template
    createTemplate: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                htmlContent: z.string().min(1),
                cssContent: z.string().optional(),
                variables: z.record(z.any()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const template = await templateService.createTemplate(input);
                return { success: true, template };
            } catch (error) {
                console.error("Erro ao criar template:", error);
                return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
            }
        }),

    // Atualizar template
    updateTemplate: protectedProcedure
        .input(
            z.object({
                templateId: z.string(),
                name: z.string().min(1).optional(),
                description: z.string().optional(),
                htmlContent: z.string().min(1).optional(),
                cssContent: z.string().optional(),
                variables: z.record(z.any()).optional(),
                isActive: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const { templateId, ...data } = input;
                const template = await templateService.updateTemplate(templateId, data);
                return { success: true, template };
            } catch (error) {
                console.error("Erro ao atualizar template:", error);
                return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
            }
        }),

    // Excluir template
    deleteTemplate: protectedProcedure
        .input(z.object({ templateId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                await templateService.deleteTemplate(input.templateId);
                return { success: true };
            } catch (error) {
                console.error("Erro ao excluir template:", error);
                return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
            }
        }),

    // Definir template padrão
    setDefaultTemplate: protectedProcedure
        .input(z.object({ templateId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const template = await templateService.setDefaultTemplate(input.templateId);
                return { success: true, template };
            } catch (error) {
                console.error("Erro ao definir template padrão:", error);
                return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
            }
        }),

    // Renderizar template
    renderTemplate: protectedProcedure
        .input(
            z.object({
                templateId: z.string(),
                postId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            try {
                const post = await prisma.post.findUnique({
                    where: { id: input.postId },
                    include: { author: true },
                });

                if (!post) {
                    throw new Error("Post não encontrado");
                }

                const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
                const postUrl = `${baseUrl}/post/${post.slug}`;

                const templateData = {
                    postTitle: post.title,
                    postContent: post.content,
                    postImageUrl: post.imageUrl ?? undefined,
                    postUrl,
                    authorName: post.author.name ?? post.author.email,
                    unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?email=example@email.com`,
                    subscriberName: "Exemplo",
                    subscriberEmail: "exemplo@email.com",
                    currentDate: new Date().toLocaleDateString("pt-BR"),
                    siteName: "Tech & Marketing & Business",
                    siteUrl: baseUrl,
                };

                const html = await templateService.renderTemplate(input.templateId, templateData);
                return { success: true, html };
            } catch (error) {
                console.error("Erro ao renderizar template:", error);
                return { success: false, message: error instanceof Error ? error.message : "Erro desconhecido" };
            }
        }),

    // Variáveis disponíveis
    getAvailableVariables: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.session.role !== "ADMIN") {
            throw new Error("Acesso negado");
        }

        return templateService.getAvailableVariables();
    }),

    // ===== AUTOMAÇÃO =====

    // Configurar automação de envio
    setAutoSend: protectedProcedure
        .input(z.object({ enabled: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.role !== "ADMIN") {
                throw new Error("Acesso negado");
            }

            // Aqui você pode implementar a configuração de automação
            // Por exemplo, salvar em uma tabela de configurações
            console.log("Automação de envio:", input.enabled ? "ativada" : "desativada");
            return { success: true };
        }),
}); 