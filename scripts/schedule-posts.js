import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function publishScheduledPosts() {
    const now = new Date();
    console.log(`🕐 Verificando posts agendados em: ${now.toLocaleString('pt-BR')}`);

    try {
        // Buscar posts agendados que devem ser publicados
        const scheduledPosts = await prisma.post.findMany({
            where: {
                scheduledAt: {
                    lte: now, // Data/hora menor ou igual ao momento atual
                },
                published: false, // Ainda não publicado
                scheduledAt: {
                    not: null, // Tem agendamento
                },
            },
        });

        console.log(`📋 Encontrados ${scheduledPosts.length} posts para publicar`);

        if (scheduledPosts.length === 0) {
            console.log('✅ Nenhum post para publicar no momento');
            return;
        }

        // Publicar cada post agendado
        for (const post of scheduledPosts) {
            try {
                console.log(`📝 Publicando post: "${post.title}" (ID: ${post.id})`);

                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        published: true,
                        publishedAt: new Date(),
                        scheduledAt: null, // Limpar agendamento após publicação
                    },
                });

                console.log(`✅ Post "${post.title}" publicado com sucesso!`);
            } catch (error) {
                console.error(`❌ Erro ao publicar post "${post.title}":`, error);
            }
        }

        console.log(`🎉 Processamento concluído. ${scheduledPosts.length} posts publicados.`);
    } catch (error) {
        console.error('🔥 Erro geral no processo de agendamento:', error);
    }
}

async function checkFutureScheduledPosts() {
    try {
        const futurePosts = await prisma.post.findMany({
            where: {
                scheduledAt: {
                    gt: new Date(), // Posts agendados para o futuro
                },
                published: false,
            },
            select: {
                id: true,
                title: true,
                scheduledAt: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });

        if (futurePosts.length > 0) {
            console.log('📅 Posts agendados para o futuro:');
            futurePosts.forEach(post => {
                console.log(`  - "${post.title}" - ${post.scheduledAt.toLocaleString('pt-BR')}`);
            });
        } else {
            console.log('📅 Nenhum post agendado para o futuro');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar posts futuros:', error);
    }
}

async function main() {
    console.log('🚀 Iniciando sistema de agendamento de posts...');

    try {
        // Verificar posts agendados para o futuro
        await checkFutureScheduledPosts();

        // Publicar posts que devem ser publicados agora
        await publishScheduledPosts();
    } catch (error) {
        console.error('🔥 Erro fatal no sistema de agendamento:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
main()
    .then(() => {
        console.log('✅ Script de agendamento concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro no script de agendamento:', error);
        process.exit(1);
    }); 