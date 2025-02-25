import type { Metadata } from "next";
import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import Navbar from "~/app/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";

// Tipagem correta para a página
interface PageProps {
  params: { slug: string };
}

// Corrigido: Tipagem correta no parâmetro da página
export default async function PostPage({ params }: PageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) return notFound();

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
        {post.imageUrl && (
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            width={800}
            height={360}
            className="mb-4 w-full rounded-lg object-cover"
            priority
          />
        )}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

// Corrigido: Tipagem correta para os metadados
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });

  if (!post) {
    return {
      title: "Post não encontrado",
      description: "Post não encontrado",
    };
  }

  return {
    title: post.title,
    description: `Leia ${post.title} no Blog.`,
  };
}

// Corrigido: Retorno no formato correto para o Next.js
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((post) => ({ slug: post.slug }));
}
