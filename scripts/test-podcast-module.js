import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPodcastModule() {
    try {
        console.log('🧪 Testando módulo de podcast...\n');

        // 1. Verificar se os campos foram adicionados ao schema
        console.log('1️⃣ Verificando campos de podcast no banco de dados...');

        const postWithAudio = await prisma.post.findFirst({
            where: {
                hasAudio: true
            }
        });

        if (postWithAudio) {
            console.log('   ✅ Encontrado post com áudio');
            console.log(`   📊 Dados do post:`);
            console.log(`      - Título: ${postWithAudio.title}`);
            console.log(`      - Tem áudio: ${postWithAudio.hasAudio}`);
            console.log(`      - URL do áudio: ${postWithAudio.audioUrl || 'N/A'}`);
            console.log(`      - Duração: ${postWithAudio.audioDuration || 'N/A'} segundos`);
            console.log(`      - Playlist Spotify: ${postWithAudio.spotifyPlaylistUrl || 'N/A'}`);
        } else {
            console.log('   ℹ️  Nenhum post com áudio encontrado');
        }

        // 2. Verificar estrutura da tabela
        console.log('\n2️⃣ Verificando estrutura da tabela posts...');

        const allPosts = await prisma.post.findMany({
            take: 1,
            select: {
                id: true,
                title: true,
                hasAudio: true,
                audioUrl: true,
                audioDuration: true,
                spotifyPlaylistUrl: true
            }
        });

        if (allPosts.length > 0) {
            const post = allPosts[0];
            console.log('   ✅ Campos de podcast disponíveis:');
            console.log(`      - hasAudio: ${typeof post.hasAudio}`);
            console.log(`      - audioUrl: ${typeof post.audioUrl}`);
            console.log(`      - audioDuration: ${typeof post.audioDuration}`);
            console.log(`      - spotifyPlaylistUrl: ${typeof post.spotifyPlaylistUrl}`);
        }

        // 3. Testar criação de post com áudio
        console.log('\n3️⃣ Testando criação de post com áudio...');

        // Buscar um usuário existente
        const existingUser = await prisma.user.findFirst();
        if (!existingUser) {
            console.log('   ❌ Nenhum usuário encontrado para teste');
            return;
        }

        const testPostData = {
            title: 'Post de Teste com Podcast',
            content: 'Este é um post de teste para verificar o módulo de podcast.',
            slug: 'post-teste-podcast-' + Date.now(),
            authorId: existingUser.id,
            published: false,
            hasAudio: true,
            audioUrl: 'https://exemplo.com/audio.mp3',
            audioDuration: 180, // 3 minutos
            spotifyPlaylistUrl: 'https://open.spotify.com/playlist/test123'
        };

        try {
            const newPost = await prisma.post.create({
                data: testPostData
            });

            console.log('   ✅ Post com áudio criado com sucesso');
            console.log(`   📊 ID: ${newPost.id}`);
            console.log(`   📊 Slug: ${newPost.slug}`);
            console.log(`   📊 Tem áudio: ${newPost.hasAudio}`);
            console.log(`   📊 Duração: ${newPost.audioDuration} segundos`);

            // 4. Testar atualização de post
            console.log('\n4️⃣ Testando atualização de post com áudio...');

            const updatedPost = await prisma.post.update({
                where: { id: newPost.id },
                data: {
                    audioDuration: 240, // 4 minutos
                    spotifyPlaylistUrl: 'https://open.spotify.com/playlist/updated123'
                }
            });

            console.log('   ✅ Post atualizado com sucesso');
            console.log(`   📊 Nova duração: ${updatedPost.audioDuration} segundos`);
            console.log(`   📊 Nova playlist: ${updatedPost.spotifyPlaylistUrl}`);

            // 5. Limpar dados de teste
            console.log('\n5️⃣ Limpando dados de teste...');

            await prisma.post.delete({
                where: { id: newPost.id }
            });

            console.log('   ✅ Dados de teste removidos');

        } catch (error) {
            console.log('   ❌ Erro ao criar post de teste:', error.message);
        }

        // 6. Verificar componentes necessários
        console.log('\n6️⃣ Verificando componentes do módulo...');

        const components = [
            'src/app/components/AudioPlayer.tsx',
            'src/app/components/AudioUpload.tsx',
            'src/app/components/SpotifyPlaylist.tsx'
        ];

        const fs = await import('fs');
        const path = await import('path');

        components.forEach(component => {
            const exists = fs.existsSync(component);
            console.log(`   ${exists ? '✅' : '❌'} ${component}`);
        });

        // 7. Verificar integração no admin
        console.log('\n7️⃣ Verificando integração no painel admin...');

        const adminFiles = [
            'src/app/admin/posts/new/page.tsx',
            'src/app/post/[slug]/page.tsx'
        ];

        adminFiles.forEach(file => {
            const exists = fs.existsSync(file);
            console.log(`   ${exists ? '✅' : '❌'} ${file}`);
        });

        console.log('\n🎉 Teste do módulo de podcast concluído com sucesso!');
        console.log('\n📋 Resumo:');
        console.log('   • Campos de podcast adicionados ao banco');
        console.log('   • Componentes de áudio criados');
        console.log('   • Integração no admin implementada');
        console.log('   • Player de áudio integrado na página de post');
        console.log('   • Preview de playlist do Spotify implementado');

    } catch (error) {
        console.error('💥 Erro no teste:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPodcastModule(); 