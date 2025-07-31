import fs from 'fs';
import path from 'path';

function testBlogTitleChanges() {
    try {
        console.log('🧪 Testando alterações do título do blog...\n');

        // 1. Verificar página principal
        console.log('1️⃣ Verificando página principal (src/app/page.tsx):');
        const pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

        const oldTitle = pageContent.includes('Blog de Tecnologia');
        const newTitle = pageContent.includes('Tech & Marketing');
        const oldDescription = pageContent.includes('desenvolvimento web, tecnologias emergentes');
        const newDescription = pageContent.includes('tecnologias - dev. & ia\'s, marketing & mundo e business & startups');

        console.log(`   ❌ Título antigo encontrado: ${oldTitle}`);
        console.log(`   ✅ Novo título encontrado: ${newTitle}`);
        console.log(`   ❌ Descrição antiga encontrada: ${oldDescription}`);
        console.log(`   ✅ Nova descrição encontrada: ${newDescription}`);

        // 2. Verificar layout principal
        console.log('\n2️⃣ Verificando layout principal (src/app/layout.tsx):');
        const layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf8');

        const oldLayoutTitle = layoutContent.includes('Blog | Ruan - Dev & Tech');
        const newLayoutTitle = layoutContent.includes('Tech & Marketing & Business | Ruan');
        const oldLayoutDesc = layoutContent.includes('desenvolvimento, tecnologia e inovação');
        const newLayoutDesc = layoutContent.includes('tecnologias, marketing e business');

        console.log(`   ❌ Título antigo do layout: ${oldLayoutTitle}`);
        console.log(`   ✅ Novo título do layout: ${newLayoutTitle}`);
        console.log(`   ❌ Descrição antiga do layout: ${oldLayoutDesc}`);
        console.log(`   ✅ Nova descrição do layout: ${newLayoutDesc}`);

        // 3. Verificar página de posts
        console.log('\n3️⃣ Verificando página de posts (src/app/post/[slug]/page.tsx):');
        const postPageContent = fs.readFileSync('src/app/post/[slug]/page.tsx', 'utf8');

        const oldPostTitle = postPageContent.includes('Blog de Tecnologia & Inovação');
        const newPostTitle = postPageContent.includes('Tech & Marketing & Business');
        const oldPostMetaTitle = postPageContent.includes('Blog Ruan');
        const newPostMetaTitle = postPageContent.includes('Tech & Marketing & Business');

        console.log(`   ❌ Título antigo da página de post: ${oldPostTitle}`);
        console.log(`   ✅ Novo título da página de post: ${newPostTitle}`);
        console.log(`   ❌ Meta título antigo: ${oldPostMetaTitle}`);
        console.log(`   ✅ Meta título novo: ${newPostMetaTitle}`);

        // 4. Verificar sistema de newsletter
        console.log('\n4️⃣ Verificando sistema de newsletter:');
        const emailContent = fs.readFileSync('src/lib/email.ts', 'utf8');
        const newsletterContent = fs.readFileSync('src/server/api/routers/newsletter.ts', 'utf8');
        const queueContent = fs.readFileSync('src/lib/queue.ts', 'utf8');

        const oldEmailLogo = emailContent.includes('Blog Ruan');
        const newEmailLogo = emailContent.includes('Tech & Marketing & Business');
        const oldNewsletterSubject = newsletterContent.includes('Newsletter do Blog Ruan');
        const newNewsletterSubject = newsletterContent.includes('Newsletter do Tech & Marketing & Business');
        const oldQueueSubject = queueContent.includes('Blog Ruan');
        const newQueueSubject = queueContent.includes('Tech & Marketing & Business');

        console.log(`   ❌ Logo antigo no email: ${oldEmailLogo}`);
        console.log(`   ✅ Logo novo no email: ${newEmailLogo}`);
        console.log(`   ❌ Assunto antigo da newsletter: ${oldNewsletterSubject}`);
        console.log(`   ✅ Assunto novo da newsletter: ${newNewsletterSubject}`);
        console.log(`   ❌ Assunto antigo da fila: ${oldQueueSubject}`);
        console.log(`   ✅ Assunto novo da fila: ${newQueueSubject}`);

        // 5. Resumo das alterações
        console.log('\n📋 Resumo das alterações:');

        const changes = [
            { name: 'Página Principal', old: oldTitle, new: newTitle },
            { name: 'Layout Principal', old: oldLayoutTitle, new: newLayoutTitle },
            { name: 'Página de Posts', old: oldPostTitle, new: newPostTitle },
            { name: 'Meta Títulos', old: oldPostMetaTitle, new: newPostMetaTitle },
            { name: 'Sistema de Email', old: oldEmailLogo, new: newEmailLogo },
            { name: 'Newsletter', old: oldNewsletterSubject, new: newNewsletterSubject },
            { name: 'Fila de Emails', old: oldQueueSubject, new: newQueueSubject }
        ];

        let successCount = 0;
        let totalChanges = changes.length;

        changes.forEach(change => {
            if (!change.old && change.new) {
                console.log(`   ✅ ${change.name}: Alterado com sucesso`);
                successCount++;
            } else if (change.old && !change.new) {
                console.log(`   ❌ ${change.name}: Ainda contém referências antigas`);
            } else if (change.old && change.new) {
                console.log(`   ⚠️  ${change.name}: Contém referências antigas e novas`);
            } else {
                console.log(`   ❓ ${change.name}: Não encontrou referências`);
            }
        });

        console.log(`\n🎯 Resultado: ${successCount}/${totalChanges} alterações aplicadas com sucesso`);

        if (successCount === totalChanges) {
            console.log('\n🎉 Todas as alterações foram aplicadas com sucesso!');
        } else {
            console.log('\n⚠️  Algumas alterações ainda precisam ser revisadas.');
        }

    } catch (error) {
        console.error('💥 Erro no teste:', error);
    }
}

testBlogTitleChanges(); 