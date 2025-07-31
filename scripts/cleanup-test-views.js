import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestViews() {
  try {
    console.log('🧹 Limpando dados de teste...\n');

    // Buscar o post de teste
    const post = await prisma.post.findFirst({
      where: { 
        slug: 'persistencia-determinacao-e-recomecos',
        published: true 
      },
      select: { id: true, title: true, viewCount: true },
    });

    if (!post) {
      console.log('❌ Post de teste não encontrado');
      return;
    }

    console.log(`📝 Post: ${post.title}`);
    console.log(`👁️  Visualizações antes da limpeza: ${post.viewCount}`);

    // Deletar todas as visualizações de teste
    const deletedViews = await prisma.postView.deleteMany({
      where: {
        postId: post.id,
        sessionId: {
          startsWith: 'test-session'
        }
      }
    });

    console.log(`🗑️  ${deletedViews.count} visualizações de teste removidas`);

    // Resetar o contador de visualizações
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: 0 }
    });

    console.log('🔄 Contador de visualizações resetado para 0');

    // Verificar resultado
    const updatedPost = await prisma.post.findUnique({
      where: { id: post.id },
      select: { viewCount: true }
    });

    console.log(`✅ Visualizações após limpeza: ${updatedPost?.viewCount}`);

  } catch (error) {
    console.error('💥 Erro na limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestViews(); 