import Queue from 'bull';
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

class QueueService {
    private newsletterQueue: Queue.Queue<NewsletterJobData>;
    private trackingQueue: Queue.Queue<EmailTrackingData>;

    constructor() {
        // Configurar Redis
        const redisConfig = {
            host: process.env.REDIS_HOST ?? 'localhost',
            port: parseInt(process.env.REDIS_PORT ?? '6379'),
            password: process.env.REDIS_PASSWORD,
        };

        this.newsletterQueue = new Queue('newsletter', { redis: redisConfig });
        this.trackingQueue = new Queue('email-tracking', { redis: redisConfig });

        this.setupQueueHandlers();
    }

    private setupQueueHandlers() {
        // Event listeners para newsletter queue
        this.newsletterQueue.on('completed', (job) => {
            console.log(`Job de newsletter completado: ${job.id}`);
        });

        this.newsletterQueue.on('failed', (job, err) => {
            console.error(`Job de newsletter falhou: ${job.id}`, err);
        });

        // Event listeners para tracking queue
        this.trackingQueue.on('completed', (job) => {
            console.log(`Job de tracking completado: ${job.id}`);
        });

        this.trackingQueue.on('failed', (job, err) => {
            console.error(`Job de tracking falhou: ${job.id}`, err);
        });

        // Processar jobs de newsletter
        void this.newsletterQueue.process(async (job) => {
            try {
                const { postId, queueId, subscriberIds, batchSize = 10 } = job.data;
                console.log(`Processando newsletter para post ${postId}, fila ${queueId}`);

                // Processar em lotes
                for (let i = 0; i < subscriberIds.length; i += batchSize) {
                    const batch = subscriberIds.slice(i, i + batchSize);

                    await Promise.all(batch.map(async (subscriberId) => {
                        try {
                            console.log(`Processando inscrito: ${subscriberId}`);
                        } catch (error) {
                            console.error(`Erro ao processar inscrito ${subscriberId}:`, error);
                        }
                    }));

                    // Pequena pausa entre lotes
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                console.log(`Newsletter processada com sucesso: ${queueId}`);

            } catch (error) {
                console.error('Erro ao processar newsletter:', error);
            }
        });

        // Processar jobs de tracking
        void this.trackingQueue.process(async (job) => {
            try {
                const { trackingId, emailLogId } = job.data;
                console.log(`Processando tracking: ${trackingId}`);

                // Aqui você pode implementar lógica adicional de tracking
                // Por exemplo, enviar dados para analytics, etc.

                console.log(`Tracking processado: ${trackingId}`);
            } catch (error) {
                console.error('Erro ao processar tracking:', error);
            }
        });
    }

    async addNewsletterToQueue(postId: string, priority = 0): Promise<string> {
        try {
            // Simular criação de fila
            const queueId = `queue-${Date.now()}`;

            // Adicionar job na fila
            await this.newsletterQueue.add(
                'send-newsletter',
                {
                    postId,
                    queueId,
                    subscriberIds: [],
                    batchSize: 10,
                },
                {
                    priority,
                    delay: 0,
                }
            );

            return queueId;
        } catch (error) {
            console.error('Erro ao adicionar newsletter na fila:', error);
            throw error;
        }
    }

    async getQueueStatus(queueId: string) {
        return { id: queueId, status: 'PENDING' };
    }

    async cancelQueue(queueId: string): Promise<boolean> {
        try {
            // Buscar jobs relacionados
            const jobs = await this.newsletterQueue.getJobs(['waiting', 'active']);
            const relatedJobs = jobs.filter(job => job.data.queueId === queueId);

            // Cancelar jobs
            for (const job of relatedJobs) {
                await job.remove();
            }

            return true;
        } catch (error) {
            console.error('Erro ao cancelar fila:', error);
            return false;
        }
    }

    async getQueueStats() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.newsletterQueue.getWaiting(),
            this.newsletterQueue.getActive(),
            this.newsletterQueue.getCompleted(),
            this.newsletterQueue.getFailed(),
        ]);

        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
        };
    }

    async cleanup() {
        await this.newsletterQueue.close();
        await this.trackingQueue.close();
    }
}

export const queueService = new QueueService(); 