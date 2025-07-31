import { PrismaClient } from '@prisma/client';
// Importações serão feitas diretamente no código

const prisma = new PrismaClient();

async function testAdvancedFeatures() {
    try {
        console.log('🧪 Testando funcionalidades avançadas...\n');

        // 1. Testar agendamento de posts
        console.log('1️⃣ Testando agendamento de posts...');

        // Buscar um usuário existente para usar como autor
        const existingUser = await prisma.user.findFirst();
        if (!existingUser) {
            console.log('❌ Nenhum usuário encontrado. Criando usuário de teste...');
            const testUser = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: 'hashedpassword',
                    name: 'Usuário Teste',
                    role: 'ADMIN',
                },
            });
            console.log(`✅ Usuário de teste criado: ${testUser.email}`);
        }

        const authorId = existingUser?.id || (await prisma.user.findFirst()).id;

        const scheduledPost = await prisma.post.create({
            data: {
                title: 'Post Agendado de Teste',
                content: 'Este é um post de teste para verificar o sistema de agendamento.',
                slug: 'post-agendado-teste',
                authorId: authorId,
                published: false,
                scheduledAt: new Date(Date.now() + 60000), // Agendar para 1 minuto no futuro
            },
        });

        console.log(`✅ Post agendado criado: ${scheduledPost.title}`);
        console.log(`📅 Data agendada: ${scheduledPost.scheduledAt}`);

        // 2. Testar sistema de filas
        console.log('\n2️⃣ Testando sistema de filas...');

        // Criar um post para testar a fila
        const testPost = await prisma.post.create({
            data: {
                title: 'Post para Teste de Fila',
                content: 'Este post será usado para testar o sistema de filas.',
                slug: 'post-teste-fila',
                authorId: authorId,
                published: true,
            },
        });

        console.log(`✅ Post para teste de fila criado: ${testPost.title}`);

        // 3. Testar configuração SMTP
        console.log('\n3️⃣ Testando configuração SMTP...');

        const smtpConfig = await prisma.smtpConfig.upsert({
            where: { id: 'test-config' },
            update: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                username: 'test@example.com',
                password: 'test-password',
                fromEmail: 'newsletter@blogruan.com',
                fromName: 'Blog Ruan - Teste',
                isActive: true,
            },
            create: {
                id: 'test-config',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                username: 'test@example.com',
                password: 'test-password',
                fromEmail: 'newsletter@blogruan.com',
                fromName: 'Blog Ruan - Teste',
                isActive: true,
            },
        });

        console.log('✅ Configuração SMTP de teste criada');

        // 4. Testar inscrições na newsletter
        console.log('\n4️⃣ Testando inscrições na newsletter...');

        const testEmails = [
            'test1@example.com',
            'test2@example.com',
            'test3@example.com',
        ];

        for (const email of testEmails) {
            await prisma.newsletterSubscriber.upsert({
                where: { email },
                update: {
                    isActive: true,
                    unsubscribedAt: null,
                },
                create: {
                    email,
                    name: `Test User ${email.split('@')[0]}`,
                    source: 'advanced_test',
                    metadata: {
                        test: true,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        }

        console.log(`✅ ${testEmails.length} inscritos de teste criados`);

        // 5. Testar estatísticas
        console.log('\n5️⃣ Verificando estatísticas...');

        const [
            totalSubscribers,
            activeSubscribers,
            totalPosts,
            publishedPosts,
            scheduledPosts,
        ] = await Promise.all([
            prisma.newsletterSubscriber.count(),
            prisma.newsletterSubscriber.count({ where: { isActive: true } }),
            prisma.post.count(),
            prisma.post.count({ where: { published: true } }),
            prisma.post.count({ where: { scheduledAt: { not: null } } }),
        ]);

        console.log(`📊 Total de inscritos: ${totalSubscribers}`);
        console.log(`📊 Inscritos ativos: ${activeSubscribers}`);
        console.log(`📊 Total de posts: ${totalPosts}`);
        console.log(`📊 Posts publicados: ${publishedPosts}`);
        console.log(`📊 Posts agendados: ${scheduledPosts}`);

        // 6. Limpeza de dados de teste
        console.log('\n6️⃣ Limpando dados de teste...');

        await prisma.newsletterSubscriber.deleteMany({
            where: {
                email: {
                    in: testEmails,
                },
            },
        });

        await prisma.post.deleteMany({
            where: {
                slug: {
                    in: ['post-agendado-teste', 'post-teste-fila'],
                },
            },
        });

        await prisma.smtpConfig.deleteMany({
            where: {
                id: 'test-config',
            },
        });

        console.log('✅ Dados de teste removidos');

        console.log('\n🎉 Teste de funcionalidades avançadas concluído com sucesso!');

    } catch (error) {
        console.error('💥 Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdvancedFeatures(); 