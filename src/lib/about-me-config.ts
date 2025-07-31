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