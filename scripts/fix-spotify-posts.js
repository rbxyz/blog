import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSpotifyPosts() {
    console.log('🔧 Corrigindo posts com URL do Spotify...');

    try {
        // Buscar posts que têm URL do Spotify mas não têm hasAudio marcado
        const postsToFix = await prisma.post.findMany({
            where: {
                spotifyPlaylistUrl: {
                    not: null,
                },
                hasAudio: false,
            },
            select: {
                id: true,
                title: true,
                spotifyPlaylistUrl: true,
                hasAudio: true,
            },
        });

        console.log(`📋 Encontrados ${postsToFix.length} posts para corrigir:`);

        if (postsToFix.length === 0) {
            console.log('✅ Nenhum post precisa ser corrigido');
            return;
        }

        // Listar posts que serão corrigidos
        postsToFix.forEach(post => {
            console.log(`  - "${post.title}" - Spotify: ${post.spotifyPlaylistUrl}`);
        });

        // Atualizar cada post
        for (const post of postsToFix) {
            try {
                await prisma.post.update({
                    where: { id: post.id },
                    data: {
                        hasAudio: true,
                    },
                });

                console.log(`✅ Post "${post.title}" corrigido - hasAudio definido como true`);
            } catch (error) {
                console.error(`❌ Erro ao corrigir post "${post.title}":`, error);
            }
        }

        console.log(`🎉 Correção concluída. ${postsToFix.length} posts atualizados.`);

    } catch (error) {
        console.error('🔥 Erro ao corrigir posts:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function listSpotifyPosts() {
    console.log('📋 Listando posts com URL do Spotify:');

    try {
        const spotifyPosts = await prisma.post.findMany({
            where: {
                spotifyPlaylistUrl: {
                    not: null,
                },
            },
            select: {
                id: true,
                title: true,
                spotifyPlaylistUrl: true,
                hasAudio: true,
                published: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (spotifyPosts.length === 0) {
            console.log('📅 Nenhum post com URL do Spotify encontrado');
            return;
        }

        console.log(`📅 Encontrados ${spotifyPosts.length} posts com URL do Spotify:`);
        spotifyPosts.forEach(post => {
            const status = post.published ? '✅ Publicado' : '⏰ Rascunho';
            const audio = post.hasAudio ? '🎵' : '🔇';

            console.log(`  ${audio} "${post.title}" (${status})`);
            console.log(`    Spotify: ${post.spotifyPlaylistUrl}`);
            console.log(`    Has Audio: ${post.hasAudio}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Erro ao listar posts do Spotify:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const command = process.argv[2];

    console.log('🔧 Script de correção de posts do Spotify');

    try {
        switch (command) {
            case 'fix':
                await fixSpotifyPosts();
                break;
            case 'list':
                await listSpotifyPosts();
                break;
            default:
                console.log('📖 Comandos disponíveis:');
                console.log('  node scripts/fix-spotify-posts.js fix  - Corrigir posts com Spotify');
                console.log('  node scripts/fix-spotify-posts.js list - Listar posts com Spotify');
                break;
        }
    } catch (error) {
        console.error('🔥 Erro no script de correção:', error);
    }
}

main()
    .then(() => {
        console.log('✅ Script de correção concluído');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro no script de correção:', error);
        process.exit(1);
    }); 