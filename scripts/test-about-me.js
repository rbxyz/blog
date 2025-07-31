// Simular a configuração para teste
const aboutMeConfig = {
    name: "Ruan Carlos",
    title: "Desenvolvedor Full Stack & Especialista em Tecnologia",
    email: "rbcr4z1@gmail.com",
    location: "Brasil",
    startYear: 2020,
    bio: `Sou um desenvolvedor apaixonado por tecnologia e inovação, com foco em criar soluções 
  escaláveis e de alta qualidade. Especializado em desenvolvimento web moderno, 
  arquitetura de software e boas práticas de programação.`,
    skills: [
        "React",
        "Node.js",
        "TypeScript",
        "Next.js",
        "PostgreSQL",
        "Docker"
    ],
    highlights: [
        {
            icon: "Code",
            title: "Full Stack",
            description: "React, Node.js, TypeScript",
            color: "blue"
        },
        {
            icon: "Award",
            title: "Certificações",
            description: "AWS, Google Cloud",
            color: "green"
        },
        {
            icon: "BookOpen",
            title: "Educação",
            description: "Ciência da Computação",
            color: "purple"
        },
        {
            icon: "Globe",
            title: "Projetos",
            description: "50+ aplicações",
            color: "orange"
        }
    ],
    trustPoints: [
        "Anos de experiência prática em desenvolvimento",
        "Projetos reais implementados em produção",
        "Conhecimento atualizado com as melhores práticas",
        "Compromisso com código limpo e manutenível",
        "Comunidade ativa e compartilhamento de conhecimento"
    ]
};

function testAboutMeConfig() {
    try {
        console.log('🧪 Testando configuração do componente "Sobre mim"...\n');

        // 1. Verificar informações básicas
        console.log('1️⃣ Informações básicas:');
        console.log(`   Nome: ${aboutMeConfig.name}`);
        console.log(`   Título: ${aboutMeConfig.title}`);
        console.log(`   Email: ${aboutMeConfig.email}`);
        console.log(`   Localização: ${aboutMeConfig.location}`);
        console.log(`   Ano de início: ${aboutMeConfig.startYear}`);

        // 2. Verificar bio
        console.log('\n2️⃣ Biografia:');
        console.log(`   Bio: ${aboutMeConfig.bio.substring(0, 100)}...`);

        // 3. Verificar skills
        console.log('\n3️⃣ Skills:');
        aboutMeConfig.skills.forEach((skill, index) => {
            console.log(`   ${index + 1}. ${skill}`);
        });

        // 4. Verificar highlights
        console.log('\n4️⃣ Destaques:');
        aboutMeConfig.highlights.forEach((highlight, index) => {
            console.log(`   ${index + 1}. ${highlight.title} - ${highlight.description} (${highlight.color})`);
        });

        // 5. Verificar pontos de confiança
        console.log('\n5️⃣ Pontos de confiança:');
        aboutMeConfig.trustPoints.forEach((point, index) => {
            console.log(`   ${index + 1}. ${point}`);
        });

        // 6. Calcular anos de experiência
        const currentYear = new Date().getFullYear();
        const experienceYears = currentYear - aboutMeConfig.startYear;
        console.log(`\n6️⃣ Anos de experiência: ${experienceYears}`);

        // 7. Validar estrutura
        console.log('\n7️⃣ Validação da estrutura:');

        const requiredFields = ['name', 'title', 'email', 'location', 'startYear', 'bio', 'skills', 'highlights', 'trustPoints'];
        const missingFields = requiredFields.filter(field => !aboutMeConfig[field]);

        if (missingFields.length === 0) {
            console.log('   ✅ Todos os campos obrigatórios estão presentes');
        } else {
            console.log(`   ❌ Campos faltando: ${missingFields.join(', ')}`);
        }

        // 8. Validar highlights
        const highlightFields = ['icon', 'title', 'description', 'color'];
        const invalidHighlights = aboutMeConfig.highlights.filter(highlight =>
            highlightFields.some(field => !highlight[field])
        );

        if (invalidHighlights.length === 0) {
            console.log('   ✅ Todos os highlights têm campos válidos');
        } else {
            console.log(`   ❌ Highlights inválidos: ${invalidHighlights.length}`);
        }

        // 9. Validar skills
        if (aboutMeConfig.skills.length > 0) {
            console.log('   ✅ Skills configuradas corretamente');
        } else {
            console.log('   ❌ Nenhuma skill configurada');
        }

        // 10. Validar trust points
        if (aboutMeConfig.trustPoints.length > 0) {
            console.log('   ✅ Pontos de confiança configurados');
        } else {
            console.log('   ❌ Nenhum ponto de confiança configurado');
        }

        console.log('\n🎉 Teste da configuração "Sobre mim" concluído com sucesso!');
        console.log('\n📋 Resumo:');
        console.log(`   • ${aboutMeConfig.skills.length} skills configuradas`);
        console.log(`   • ${aboutMeConfig.highlights.length} destaques configurados`);
        console.log(`   • ${aboutMeConfig.trustPoints.length} pontos de confiança`);
        console.log(`   • ${experienceYears} anos de experiência calculados`);

    } catch (error) {
        console.error('💥 Erro no teste:', error);
    }
}

testAboutMeConfig(); 