// Sistema de filas simplificado sem dependência do Bull
import { prisma } from '~/server/db';
import { emailService } from '~/lib/email';

interface NewsletterJobData {
    postId: string;
    queueId: string;
    subscriberIds: string[];
    batchSize?: number;
}

interface EmailTrackingData {
    trackingId: string;
    emailLogId: string;
}

interface QueueJob {
    id: string;
    data: NewsletterJobData | EmailTrackingData;
    type: 'newsletter' | 'tracking';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
}

class QueueService {
    private jobs = new Map<string, QueueJob>();
    private isProcessing = false;

    constructor() {
        console.log('🚀 Sistema de filas simplificado inicializado');
    }

    async addNewsletterToQueue(postId: string, _priority = 0): Promise<string> {
        try {
            const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            const job: QueueJob = {
                id: queueId,
                data: {
                    postId,
                    queueId,
                    subscriberIds: [],
                    batchSize: 10,
                },
                type: 'newsletter',
                status: 'pending',
                createdAt: new Date(),
            };

            this.jobs.set(queueId, job);

            // Processar imediatamente (simulação)
            void this.processNewsletterJob(job);

            return queueId;
        } catch (error) {
            console.error('Erro ao adicionar newsletter na fila:', error);
            throw error;
        }
    }

    private async processNewsletterJob(job: QueueJob): Promise<void> {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        job.status = 'processing';

        try {
            const { postId, queueId, subscriberIds, batchSize = 10 } = job.data as NewsletterJobData;
            console.log(`Processando newsletter para post ${postId}, fila ${queueId}`);

            // Buscar dados do post
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { author: true },
            });

            if (!post) {
                throw new Error(`Post ${postId} não encontrado`);
            }

            // Buscar inscritos se não fornecidos
            const subscribers = subscriberIds.length > 0
                ? await prisma.newsletterSubscriber.findMany({
                    where: { id: { in: subscriberIds }, isActive: true }
                })
                : await prisma.newsletterSubscriber.findMany({
                    where: { isActive: true }
                });

            // Atualizar status da fila
            await prisma.newsletterQueue.update({
                where: { id: queueId },
                data: {
                    status: 'PROCESSING',
                    startedAt: new Date(),
                    totalSubscribers: subscribers.length,
                },
            });

            // Inicializar serviço de email
            await emailService.initialize();

            const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
            const postUrl = `${baseUrl}/post/${post.slug}`;

            let successCount = 0;
            let errorCount = 0;

            // Processar em lotes
            for (let i = 0; i < subscribers.length; i += batchSize) {
                const batch = subscribers.slice(i, i + batchSize);

                await Promise.all(batch.map(async (subscriber) => {
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
                                'NEWSLETTER',
                                'SENT',
                                post.id
                            );
                            successCount++;
                        } else {
                            await emailService.logEmail(
                                subscriber.id,
                                'NEWSLETTER',
                                'FAILED',
                                post.id,
                                'Falha no envio'
                            );
                            errorCount++;
                        }
                    } catch (error) {
                        console.error(`Erro ao enviar email para ${subscriber.email}:`, error);
                        await emailService.logEmail(
                            subscriber.id,
                            'NEWSLETTER',
                            'FAILED',
                            post.id,
                            error instanceof Error ? error.message : 'Erro desconhecido'
                        );
                        errorCount++;
                    }
                }));

                // Atualizar progresso
                await prisma.newsletterQueue.update({
                    where: { id: queueId },
                    data: {
                        progress: Math.round(((i + batchSize) / subscribers.length) * 100),
                        sentCount: successCount,
                        failedCount: errorCount,
                    },
                });

                // Pequena pausa entre lotes
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Finalizar fila
            await prisma.newsletterQueue.update({
                where: { id: queueId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    progress: 100,
                    sentCount: successCount,
                    failedCount: errorCount,
                },
            });

            job.status = 'completed';
            console.log(`Newsletter processada com sucesso: ${queueId} - ${successCount} sucessos, ${errorCount} erros`);

        } catch (error) {
            console.error('Erro ao processar newsletter:', error);
            job.status = 'failed';

            // Marcar fila como falhada
            try {
                await prisma.newsletterQueue.update({
                    where: { id: (job.data as NewsletterJobData).queueId },
                    data: {
                        status: 'FAILED',
                        error: error instanceof Error ? error.message : 'Erro desconhecido',
                    },
                });
            } catch (updateError) {
                console.error('Erro ao atualizar status da fila:', updateError);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    async getQueueStatus(queueId: string) {
        const job = this.jobs.get(queueId);
        if (!job) {
            return { id: queueId, status: 'NOT_FOUND' };
        }
        return { id: queueId, status: job.status };
    }

    async cancelQueue(queueId: string): Promise<boolean> {
        try {
            const job = this.jobs.get(queueId);
            if (job && job.status === 'pending') {
                job.status = 'failed';
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao cancelar fila:', error);
            return false;
        }
    }

    async getQueueStats() {
        const jobs = Array.from(this.jobs.values());

        return {
            waiting: jobs.filter(j => j.status === 'pending').length,
            active: jobs.filter(j => j.status === 'processing').length,
            completed: jobs.filter(j => j.status === 'completed').length,
            failed: jobs.filter(j => j.status === 'failed').length,
        };
    }

    async cleanup() {
        this.jobs.clear();
        console.log('🧹 Sistema de filas limpo');
    }
}

export const queueService = new QueueService(); 