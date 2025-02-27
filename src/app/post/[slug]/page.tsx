import type { Metadata } from "next";
import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import "~/styles/markdown.css";

// ✅ Corrigindo a tipagem do `params`
type PageParams = Promise<{ slug: string }>;

export default async function PostPage({ params }: { params: PageParams }) {
  const { slug } = await params; // 🔹 Aguarda o `params` ser resolvido corretamente
  if (!slug) return notFound();

  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post) return notFound();

  return (
    <div>
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>

        {post.imageUrl && (
          <img
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            className="h-24 w-24 rounded object-cover"
          />
        )}

        <article className="markdown-container prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold">{children}</h2>
              ),
              p: ({ children }) => <p className="mb-4">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5">{children}</ol>
              ),
              code: ({ children }) => (
                <code className="rounded bg-gray-800 px-2 py-1 text-white">
                  {children}
                </code>
              ),
            }}
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
