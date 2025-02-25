import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import Navbar from "~/app/components/Navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// ✅ Define a função `generateStaticParams` corretamente
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug, // 🔹 Garante que `slug` é sempre uma string válida
  }));
}

// ✅ Define corretamente os parâmetros da página
interface PostPageProps {
  params: { slug: string };
}

export default async function PostPage({ params }: PostPageProps) {
  if (!params?.slug) {
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
          <img
            src={post.imageUrl}
            alt={post.title}
            className="mb-4 w-full rounded-lg object-cover"
            style={{ height: "360px" }}
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
