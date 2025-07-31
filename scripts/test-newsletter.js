import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNewsletter() {
    try {
        console.log('🧪 Testando sistema de newsletter...\n');

        // 1. Testar criação de configuração SMTP
        console.log('1️⃣ Criando configuração SMTP de teste...');

        const smtpConfig = await prisma.smtpConfig.upsert({
            where: { id: 'default' },
            update: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                username: 'test@example.com',
                password: 'test-password',
                fromEmail: 'newsletter@blogruan.com',
                fromName: 'Blog Ruan',
                isActive: true,
            },
            create: {
                id: 'default',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                username: 'test@example.com',
                password: 'test-password',
                fromEmail: 'newsletter@blogruan.com',
                fromName: 'Blog Ruan',
                isActive: true,
            },
        });

        console.log('✅ Configuração SMTP criada:', smtpConfig.host);

        // 2. Testar inscrições na newsletter
        console.log('\n2️⃣ Testando inscrições na newsletter...');

        const testEmails = [
            'test1@example.com',
            'test2@example.com',
            'test3@example.com',
        ];

        for (const email of testEmails) {
            try {
                const subscriber = await prisma.newsletterSubscriber.upsert({
                    where: { email },
                    update: {
                        isActive: true,
                        unsubscribedAt: null,
                    },
                    create: {
                        email,
                        name: `Test User ${email.split('@')[0]}`,
                        source: 'test_script',
                        metadata: {
                            test: true,
                            timestamp: new Date().toISOString(),
                        },
                    },
                });

                console.log(`✅ Inscrito criado: ${subscriber.email}`);
            } catch (error) {
                console.log(`⚠️ Erro ao criar inscrito ${email}:`, error.message);
            }
        }

        // 3. Verificar estatísticas
        console.log('\n3️⃣ Verificando estatísticas...');

        const [
            totalSubscribers,
            activeSubscribers,
            unsubscribedCount,
        ] = await Promise.all([
            prisma.newsletterSubscriber.count(),
            prisma.newsletterSubscriber.count({ where: { isActive: true } }),
            prisma.newsletterSubscriber.count({ where: { isActive: false } }),
        ]);

        console.log(`📊 Total de inscritos: ${totalSubscribers}`);
        console.log(`📊 Inscritos ativos: ${activeSubscribers}`);
        console.log(`📊 Inscritos cancelados: ${unsubscribedCount}`);

        // 4. Testar cancelamento de inscrição
        console.log('\n4️⃣ Testando cancelamento de inscrição...');

        const subscriberToUnsubscribe = await prisma.newsletterSubscriber.findFirst({
            where: { isActive: true },
        });

        if (subscriberToUnsubscribe) {
            await prisma.newsletterSubscriber.update({
                where: { id: subscriberToUnsubscribe.id },
                data: {
                    isActive: false,
                    unsubscribedAt: new Date(),
                },
            });

            console.log(`✅ Inscrição cancelada: ${subscriberToUnsubscribe.email}`);
        }

        // 5. Listar todos os inscritos
        console.log('\n5️⃣ Listando todos os inscritos...');

        const allSubscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { subscribedAt: 'desc' },
            include: {
                _count: {
                    select: { emailLogs: true },
                },
            },
        });

        allSubscribers.forEach((subscriber, index) => {
            console.log(`${index + 1}. ${subscriber.email} - ${subscriber.name || 'Sem nome'} - ${subscriber.isActive ? 'Ativo' : 'Cancelado'} - ${subscriber._count.emailLogs} emails`);
        });

        // 6. Limpar dados de teste
        console.log('\n6️⃣ Limpando dados de teste...');

        const deletedSubscribers = await prisma.newsletterSubscriber.deleteMany({
            where: {
                email: {
                    in: testEmails,
                },
            },
        });

        const deletedConfig = await prisma.smtpConfig.deleteMany({
            where: {
                id: 'default',
            },
        });

        console.log(`🗑️ ${deletedSubscribers.count} inscritos de teste removidos`);
        console.log(`🗑️ ${deletedConfig.count} configurações SMTP de teste removidas`);

        console.log('\n✅ Teste do sistema de newsletter concluído com sucesso!');

    } catch (error) {
        console.error('💥 Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNewsletter(); 