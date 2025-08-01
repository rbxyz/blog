import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPost(slug) {
    console.log(`🔍 Debugando post: ${slug}`);

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
        });

        if (!post) {
            console.log('❌ Post não encontrado');
            return;
        }

        console.log('📋 Dados do post:');
        console.log(`  ID: ${post.id}`);
        console.log(`  Título: ${post.title}`);
        console.log(`  Slug: ${post.slug}`);
        console.log(`  Publicado: ${post.published}`);
        console.log(`  Has Audio: ${post.hasAudio}`);
        console.log(`  Audio URL: ${post.audioUrl || 'N/A'}`);
        console.log(`  Spotify URL: ${post.spotifyPlaylistUrl || 'N/A'}`);
        console.log(`  Agendado para: ${post.scheduledAt ? post.scheduledAt.toLocaleString('pt-BR') : 'N/A'}`);
        console.log(`  Criado em: ${post.createdAt.toLocaleString('pt-BR')}`);

        // Verificar condições para exibir o card do Spotify
        console.log('\n🔍 Verificando condições para o card do Spotify:');
        console.log(`  hasAudio: ${post.hasAudio}`);
        console.log(`  spotifyPlaylistUrl: ${post.spotifyPlaylistUrl ? 'Presente' : 'Ausente'}`);
        console.log(`  Condição completa: ${post.hasAudio && post.spotifyPlaylistUrl ? '✅ Card deve aparecer' : '❌ Card não deve aparecer'}`);

    } catch (error) {
        console.error('❌ Erro ao debugar post:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function listAllPosts() {
    console.log('📋 Listando todos os posts:');

    try {
        const posts = await prisma.post.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                published: true,
                hasAudio: true,
                spotifyPlaylistUrl: true,
                scheduledAt: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        posts.forEach(post => {
            const status = post.published ? '✅ Publicado' : '⏰ Agendado/Rascunho';
            const audio = post.hasAudio ? '🎵' : '🔇';
            const spotify = post.spotifyPlaylistUrl ? '🎧' : '🔇';

            console.log(`  ${audio}${spotify} "${post.title}" (${status})`);
            console.log(`    Slug: ${post.slug}`);
            console.log(`    Spotify: ${post.spotifyPlaylistUrl || 'N/A'}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro ao listar posts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const command = process.argv[2];
    const slug = process.argv[3];

    console.log('🔍 Script de debug de posts');

    try {
        switch (command) {
            case 'post':
                if (!slug) {
                    console.log('❌ Por favor, forneça o slug do post');
                    console.log('   Exemplo: node scripts/debug-post.js post meu-post-slug');
                    return;
                }
                await debugPost(slug);
                break;
            case 'list':
                await listAllPosts();
                break;
            default:
                console.log('📖 Comandos disponíveis:');
                console.log('  node scripts/debug-post.js post <slug> - Debugar post específico');
                console.log('  node scripts/debug-post.js list        - Listar todos os posts');
                break;
        }
    } catch (error) {
        console.error('🔥 Erro no script de debug:', error);
    }
}

main()
    .then(() => {
        console.log('✅ Script de debug concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro no script de debug:', error);
        process.exit(1);
    }); 