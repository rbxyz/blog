#!/usr/bin/env node

/**
 * Script de Teste do Sistema de Agendamento
 * 
 * Este script cria posts de teste para verificar o funcionamento
 * do sistema de agendamento.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPosts() {
    console.log('🧪 Criando posts de teste para agendamento...');

    const now = new Date();
    const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
    const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    const testPosts = [
        {
            title: 'Post de Teste - 5 minutos',
            content: 'Este post será publicado automaticamente em 5 minutos.',
            slug: 'post-teste-5min',
            scheduledAt: in5Minutes,
            published: false,
        },
        {
            title: 'Post de Teste - 10 minutos',
            content: 'Este post será publicado automaticamente em 10 minutos.',
            slug: 'post-teste-10min',
            scheduledAt: in10Minutes,
            published: false,
        },
        {
            title: 'Post de Teste - 1 hora',
            content: 'Este post será publicado automaticamente em 1 hora.',
            slug: 'post-teste-1hora',
            scheduledAt: in1Hour,
            published: false,
        },
    ];

    try {
        for (const postData of testPosts) {
            // Verificar se o post já existe
            const existingPost = await prisma.post.findUnique({
                where: { slug: postData.slug },
            });

            if (existingPost) {
                console.log(`⚠️ Post "${postData.title}" já existe, atualizando...`);
                await prisma.post.update({
                    where: { id: existingPost.id },
                    data: {
                        title: postData.title,
                        content: postData.content,
                        scheduledAt: postData.scheduledAt,
                        published: postData.published,
                    },
                });
            } else {
                console.log(`✅ Criando post "${postData.title}"...`);
                await prisma.post.create({
                    data: {
                        ...postData,
                        authorId: 'test-author-id', // Você pode precisar ajustar isso
                    },
                });
            }
        }

        console.log('🎉 Posts de teste criados com sucesso!');
        console.log('\n📅 Agendamentos:');
        console.log(`  - 5 minutos: ${in5Minutes.toLocaleString('pt-BR')}`);
        console.log(`  - 10 minutos: ${in10Minutes.toLocaleString('pt-BR')}`);
        console.log(`  - 1 hora: ${in1Hour.toLocaleString('pt-BR')}`);

        console.log('\n🚀 Execute o script de agendamento para testar:');
        console.log('   node scripts/schedule-posts.js');

    } catch (error) {
        console.error('❌ Erro ao criar posts de teste:', error);
    }
}

async function listScheduledPosts() {
    console.log('\n📋 Posts agendados atualmente:');

    try {
        const scheduledPosts = await prisma.post.findMany({
            where: {
                scheduledAt: { not: null },
                published: false,
            },
            select: {
                id: true,
                title: true,
                slug: true,
                scheduledAt: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });

        if (scheduledPosts.length === 0) {
            console.log('  Nenhum post agendado encontrado.');
            return;
        }

        scheduledPosts.forEach(post => {
            const timeUntil = Math.round((post.scheduledAt.getTime() - new Date().getTime()) / 1000 / 60);
            console.log(`  - "${post.title}" (${post.slug})`);
            console.log(`    Agendado para: ${post.scheduledAt.toLocaleString('pt-BR')}`);
            console.log(`    Tempo restante: ${timeUntil} minutos`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro ao listar posts agendados:', error);
    }
}

async function cleanupTestPosts() {
    console.log('🧹 Limpando posts de teste...');

    try {
        const testSlugs = ['post-teste-5min', 'post-teste-10min', 'post-teste-1hora'];

        for (const slug of testSlugs) {
            await prisma.post.deleteMany({
                where: { slug },
            });
        }

        console.log('✅ Posts de teste removidos com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao limpar posts de teste:', error);
    }
}

async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'create':
            await createTestPosts();
            break;
        case 'list':
            await listScheduledPosts();
            break;
        case 'cleanup':
            await cleanupTestPosts();
            break;
        default:
            console.log('📖 Uso do script de teste:');
            console.log('  node scripts/test-scheduling.js create  - Criar posts de teste');
            console.log('  node scripts/test-scheduling.js list    - Listar posts agendados');
            console.log('  node scripts/test-scheduling.js cleanup - Remover posts de teste');
            break;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro no script de teste:', error);
            process.exit(1);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}

module.exports = {
    createTestPosts,
    listScheduledPosts,
    cleanupTestPosts,
}; 