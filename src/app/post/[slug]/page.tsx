import type { Metadata } from "next";
import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import Navbar from "~/app/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";
import { GetStaticPropsContext } from "next"; // 🔹 Importa corretamente os tipos do Next.js

// ✅ Gera os slugs corretamente para pré-renderização
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });

  return posts.map((post) => ({ slug: post.slug }));
}

// ✅ Define os metadados dinâmicos para SEO
export async function generateMetadata({
  params,
}: GetStaticPropsContext<{ slug: string }>): Promise<Metadata> {
  if (!params?.slug) return { title: "Post não encontrado" };

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  });

  return {
    title: post?.title ?? "Post não encontrado",
    description: post ? `Leia ${post.title} no Blog.` : "Post não encontrado",
  };
}

// ✅ Ajusta corretamente a tipagem de `params`
export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!params.slug) {
    console.error("❌ Erro: Nenhum slug encontrado nos parâmetros da página.");
    return notFound();
  }

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
            src={post.imageUrl}
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
