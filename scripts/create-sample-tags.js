import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTags = [
    {
        name: "JavaScript",
        description: "Posts sobre JavaScript, ES6+, frameworks e bibliotecas",
        color: "#F7DF1E"
    },
    {
        name: "React",
        description: "Tutoriais e dicas sobre React e ecossistema",
        color: "#61DAFB"
    },
    {
        name: "Node.js",
        description: "Desenvolvimento backend com Node.js",
        color: "#339933"
    },
    {
        name: "TypeScript",
        description: "TypeScript e tipagem estática",
        color: "#3178C6"
    },
    {
        name: "Marketing",
        description: "Estratégias de marketing digital",
        color: "#FF6B6B"
    },
    {
        name: "Business",
        description: "Empreendedorismo e negócios",
        color: "#4ECDC4"
    },
    {
        name: "IA",
        description: "Inteligência Artificial e Machine Learning",
        color: "#9B59B6"
    },
    {
        name: "DevOps",
        description: "DevOps, CI/CD e infraestrutura",
        color: "#E67E22"
    },
    {
        name: "Design",
        description: "UI/UX e design de interfaces",
        color: "#E74C3C"
    },
    {
        name: "Startup",
        description: "Empreendedorismo e startups",
        color: "#2ECC71"
    }
];

async function createSampleTags() {
    try {
        console.log("🚀 Criando tags de exemplo...");

        for (const tagData of sampleTags) {
            const slug = tagData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();

            const existingTag = await prisma.tag.findUnique({
                where: { slug }
            });

            if (existingTag) {
                console.log(`⚠️  Tag "${tagData.name}" já existe, pulando...`);
                continue;
            }

            const tag = await prisma.tag.create({
                data: {
                    name: tagData.name,
                    slug,
                    description: tagData.description,
                    color: tagData.color,
                }
            });

            console.log(`✅ Tag criada: ${tag.name} (${tag.slug})`);
        }

        console.log("🎉 Tags de exemplo criadas com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao criar tags:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleTags(); 