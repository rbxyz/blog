export interface AboutMeConfig {
    name: string;
    title: string;
    email: string;
    location: string;
    startYear: number;
    bio: string;
    skills: string[];
    highlights: {
        icon: string;
        title: string;
        description: string;
        color: string;
    }[];
    trustPoints: string[];
}

export const aboutMeConfig: AboutMeConfig = {
    name: "Ruan Bueno",
    title: "Dev. Full Stack & Gestor de Tráfego & Marketeiro",
    email: "rbcr4z1@gmail.com",
    location: "Brasil, Rio Grande do Sul",
    startYear: 2020,
    bio: `entusiasta de café & automação & tech -> esse é o Ruan.
Me chamo Ruan Bueno, especialista em Gestão de Tráfego Pago e Conversão Digital, formado como Técnico em Informática e desenvolvedor de tecnologias/soluções para todos os tipos de negócios. Minha missão é transformar estratégias digitais em resultados concretos, conectando marcas ao público certo e convertendo cliques em clientes.`,
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