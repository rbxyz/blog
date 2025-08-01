import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPosts() {
    console.log('🧪 Criando posts de teste para agendamento...');

    const now = new Date();
    const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
    const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

    const testPosts = [
        {
            title: 'Post de Teste - Publicação em 5 minutos',
            content: 'Este post será publicado automaticamente em 5 minutos.',
            slug: 'post-teste-5-minutos',
            published: false,
            scheduledAt: in5Minutes,
        },
        {
            title: 'Post de Teste - Publicação em 10 minutos',
            content: 'Este post será publicado automaticamente em 10 minutos.',
            slug: 'post-teste-10-minutos',
            published: false,
            scheduledAt: in10Minutes,
        },
        {
            title: 'Post de Teste - Publicação em 1 hora',
            content: 'Este post será publicado automaticamente em 1 hora.',
            slug: 'post-teste-1-hora',
            published: false,
            scheduledAt: in1Hour,
        },
    ];

    for (const postData of testPosts) {
        try {
            const post = await prisma.post.create({
                data: postData,
            });
            console.log(`✅ Post criado: "${post.title}" - Agendado para: ${post.scheduledAt.toLocaleString('pt-BR')}`);
        } catch (error) {
            console.error(`❌ Erro ao criar post "${postData.title}":`, error);
        }
    }
}

async function listScheduledPosts() {
    console.log('📋 Listando posts agendados...');

    try {
        const scheduledPosts = await prisma.post.findMany({
            where: {
                scheduledAt: {
                    not: null,
                },
                published: false,
            },
            select: {
                id: true,
                title: true,
                scheduledAt: true,
                published: true,
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });

        if (scheduledPosts.length === 0) {
            console.log('📅 Nenhum post agendado encontrado');
            return;
        }

        console.log(`📅 Encontrados ${scheduledPosts.length} posts agendados:`);
        scheduledPosts.forEach(post => {
            const status = post.published ? '✅ Publicado' : '⏰ Agendado';
            console.log(`  - "${post.title}" - ${post.scheduledAt.toLocaleString('pt-BR')} (${status})`);
        });
    } catch (error) {
        console.error('❌ Erro ao listar posts agendados:', error);
    }
}

async function cleanupTestPosts() {
    console.log('🧹 Limpando posts de teste...');

    try {
        const testPosts = await prisma.post.findMany({
            where: {
                title: {
                    contains: 'Post de Teste',
                },
            },
        });

        if (testPosts.length === 0) {
            console.log('✅ Nenhum post de teste encontrado para limpar');
            return;
        }

        for (const post of testPosts) {
            await prisma.post.delete({
                where: { id: post.id },
            });
            console.log(`🗑️ Post removido: "${post.title}"`);
        }

        console.log(`✅ ${testPosts.length} posts de teste removidos`);
    } catch (error) {
        console.error('❌ Erro ao limpar posts de teste:', error);
    }
}

async function main() {
    const command = process.argv[2];

    console.log('🧪 Script de teste do sistema de agendamento');

    try {
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
                console.log('📖 Comandos disponíveis:');
                console.log('  node scripts/test-scheduling.js create  - Criar posts de teste');
                console.log('  node scripts/test-scheduling.js list    - Listar posts agendados');
                console.log('  node scripts/test-scheduling.js cleanup - Limpar posts de teste');
                break;
        }
    } catch (error) {
        console.error('🔥 Erro no script de teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .then(() => {
        console.log('✅ Script de teste concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro no script de teste:', error);
        process.exit(1);
    }); 