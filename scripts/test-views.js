import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testViews() {
    try {
        console.log('🧪 Testando sistema de visualizações...\n');

        // Buscar um post para testar
        const post = await prisma.post.findFirst({
            where: { published: true },
            select: { id: true, title: true, slug: true, viewCount: true },
        });

        if (!post) {
            console.log('❌ Nenhum post publicado encontrado para teste');
            return;
        }

        console.log(`📝 Post selecionado: ${post.title}`);
        console.log(`🔗 Slug: ${post.slug}`);
        console.log(`👁️  Visualizações atuais: ${post.viewCount}\n`);

        // Simular múltiplas visualizações da mesma sessão
        const sessionId = 'test-session-456';

        console.log('🔄 Simulando visualizações da mesma sessão...');

        for (let i = 0; i < 3; i++) {
            try {
                // Usar transação para simular a função recordPostView
                await prisma.$transaction(async (tx) => {
                    // Verificar se já existe uma visualização para esta sessão
                    const existingView = await tx.postView.findFirst({
                        where: {
                            postId: post.id,
                            sessionId: sessionId,
                        },
                    });

                    if (existingView) {
                        console.log(`⚠️  Visualização ${i + 1} já existe (esperado)`);
                        return;
                    }

                    // Criar nova visualização
                    await tx.postView.create({
                        data: {
                            postId: post.id,
                            sessionId: sessionId,
                            ipAddress: '127.0.0.1',
                            userAgent: 'Test Browser',
                        },
                    });

                    // Atualizar o contador total de visualizações
                    await tx.post.update({
                        where: { id: post.id },
                        data: { viewCount: { increment: 1 } },
                    });

                    console.log(`✅ Visualização ${i + 1} registrada`);
                });
            } catch (error) {
                console.log(`⚠️  Visualização ${i + 1} já existe (esperado)`);
            }
        }

        // Simular visualizações de sessões diferentes
        console.log('\n🔄 Simulando visualizações de sessões diferentes...');

        for (let i = 0; i < 5; i++) {
            const uniqueSessionId = `test-session-${Date.now()}-${i}`;

            try {
                // Usar transação para simular a função recordPostView
                await prisma.$transaction(async (tx) => {
                    // Verificar se já existe uma visualização para esta sessão
                    const existingView = await tx.postView.findFirst({
                        where: {
                            postId: post.id,
                            sessionId: uniqueSessionId,
                        },
                    });

                    if (existingView) {
                        console.log(`⚠️  Visualização única ${i + 1} já existe`);
                        return;
                    }

                    // Criar nova visualização
                    await tx.postView.create({
                        data: {
                            postId: post.id,
                            sessionId: uniqueSessionId,
                            ipAddress: `192.168.1.${i + 1}`,
                            userAgent: `Test Browser ${i + 1}`,
                        },
                    });

                    // Atualizar o contador total de visualizações
                    await tx.post.update({
                        where: { id: post.id },
                        data: { viewCount: { increment: 1 } },
                    });

                    console.log(`✅ Visualização única ${i + 1} registrada`);
                });
            } catch (error) {
                console.error(`❌ Erro na visualização única ${i + 1}:`, error.message);
            }
        }

        // Verificar resultados
        console.log('\n📊 Verificando resultados...');

        const updatedPost = await prisma.post.findUnique({
            where: { id: post.id },
            select: { viewCount: true },
        });

        const totalViews = await prisma.postView.count({
            where: { postId: post.id },
        });

        console.log(`👁️  Visualizações totais: ${updatedPost?.viewCount}`);
        console.log(`🔢 Registros únicos: ${totalViews}`);

        // Listar todas as visualizações
        const views = await prisma.postView.findMany({
            where: { postId: post.id },
            select: {
                id: true,
                sessionId: true,
                ipAddress: true,
                userAgent: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        console.log('\n📋 Lista de visualizações:');
        views.forEach((view, index) => {
            console.log(`${index + 1}. Sessão: ${view.sessionId.substring(0, 20)}... | IP: ${view.ipAddress} | Data: ${view.createdAt.toLocaleString()}`);
        });

    } catch (error) {
        console.error('💥 Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testViews(); 