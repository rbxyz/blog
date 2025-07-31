import { PrismaClient } from '@prisma/client';
import { queueService } from '../src/lib/queue.js';

const prisma = new PrismaClient();

async function processScheduledPosts() {
    try {
        console.log('🕐 Verificando posts agendados...');

        const now = new Date();

        // Buscar posts agendados que devem ser publicados
        const scheduledPosts = await prisma.post.findMany({
            where: {
                scheduledAt: {
                    lte: now, // Data agendada menor ou igual a agora
                },
                published: false, // Ainda não publicado
            },
            include: {
                author: true,
            },
        });

        if (scheduledPosts.length === 0) {
            console.log('✅ Nenhum post agendado para publicar');
            return;
        }

        console.log(`📝 Encontrados ${scheduledPosts.length} posts para publicar`);

        for (const post of scheduledPosts) {
            try {
                console.log(`📅 Publicando post: ${post.title}`);

                // Publicar o post
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        published: true,
                        publishedAt: new Date(),
                        scheduledAt: null, // Limpar data agendada
                    },
                });

                console.log(`✅ Post publicado: ${post.title}`);

                // Opcional: Enviar newsletter automaticamente
                try {
                    const queueId = await queueService.addNewsletterToQueue(post.id, 5);
                    console.log(`📧 Newsletter agendada para envio: ${queueId}`);
                } catch (error) {
                    console.error(`❌ Erro ao agendar newsletter para ${post.title}:`, error.message);
                }

            } catch (error) {
                console.error(`❌ Erro ao publicar post ${post.title}:`, error.message);
            }
        }

        console.log('✅ Processamento de posts agendados concluído');

    } catch (error) {
        console.error('💥 Erro no processamento de posts agendados:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    processScheduledPosts();
}

export { processScheduledPosts }; 