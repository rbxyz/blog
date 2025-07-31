#!/usr/bin/env node

/**
 * Script de Agendamento de Posts
 * 
 * Este script verifica posts agendados e os publica automaticamente
 * quando a data/hora de agendamento é atingida.
 * 
 * Uso:
 * - Execução manual: node scripts/schedule-posts.js
 * - Cron job: */5 * * * * node / path / to / scripts / schedule - posts.js
    */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function publishScheduledPosts() {
    const now = new Date();
    console.log(`🕐 Verificando posts agendados em: ${now.toISOString()}`);

    try {
        // Buscar posts agendados que devem ser publicados
        const scheduledPosts = await prisma.post.findMany({
            where: {
                scheduledAt: { lte: now },
                published: false,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                scheduledAt: true,
            },
        });

        if (scheduledPosts.length === 0) {
            console.log('📭 Nenhum post agendado para publicação');
            return;
        }

        console.log(`📝 Encontrados ${scheduledPosts.length} posts para publicar`);

        // Publicar cada post agendado
        for (const post of scheduledPosts) {
            try {
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        published: true,
                        publishedAt: now,
                        scheduledAt: null, // Limpar agendamento após publicação
                    },
                });

                console.log(`✅ Post "${post.title}" (${post.slug}) publicado automaticamente`);

                // Log da atividade
                console.log(`📊 Post ID: ${post.id}`);
                console.log(`📅 Agendado para: ${post.scheduledAt?.toISOString()}`);
                console.log(`🕐 Publicado em: ${now.toISOString()}`);
                console.log('---');

            } catch (error) {
                console.error(`❌ Erro ao publicar post "${post.title}":`, error.message);
            }
        }

        console.log(`🎉 Processo concluído. ${scheduledPosts.length} posts publicados.`);

    } catch (error) {
        console.error('🔥 Erro geral no processo de agendamento:', error);
    }
}

async function checkUpcomingScheduledPosts() {
    try {
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // Próxima hora

        const upcomingPosts = await prisma.post.findMany({
            where: {
                scheduledAt: {
                    gte: now,
                    lte: nextHour,
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

        if (upcomingPosts.length > 0) {
            console.log(`⏰ Posts agendados para a próxima hora:`);
            upcomingPosts.forEach(post => {
                const timeUntil = Math.round((post.scheduledAt.getTime() - now.getTime()) / 1000 / 60);
                console.log(`  - "${post.title}" em ${timeUntil} minutos`);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao verificar posts futuros:', error);
    }
}

async function main() {
    console.log('🚀 Iniciando sistema de agendamento de posts...');

    try {
        // Verificar posts para publicação
        await publishScheduledPosts();

        // Verificar posts futuros (opcional)
        await checkUpcomingScheduledPosts();

    } catch (error) {
        console.error('🔥 Erro fatal no sistema de agendamento:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main()
        .then(() => {
            console.log('✅ Script de agendamento concluído');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro no script de agendamento:', error);
            process.exit(1);
        });
}

module.exports = {
    publishScheduledPosts,
    checkUpcomingScheduledPosts,
}; 