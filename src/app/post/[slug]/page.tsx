import type { Metadata } from "next";
import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import Navbar from "~/app/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";

// ✅ Corrigindo a tipagem do `params`
type PageParams = Promise<{ slug: string }>;

export default async function PostPage({ params }: { params: PageParams }) {
  const { slug } = await params; // 🔹 Aguarda o `params` ser resolvido corretamente
  if (!slug) return notFound();

  const post = await prisma.post.findUnique({ where: { slug } });

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

// ✅ Geração estática dos slugs
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((post) => ({ slug: post.slug }));
}

// ✅ Metadados dinâmicos para SEO
export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params; // 🔹 Aguarda o `params`
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true },
  });

  return {
    title: post?.title ?? "Post não encontrado",
    description: post ? `Leia ${post.title} no Blog.` : "Post não encontrado",
  };
}
