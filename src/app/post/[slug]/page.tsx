import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize"; // 🔹 Evita bloqueio de HTML perigoso
import "~/styles/markdown.css"; // 🔹 Certifique-se de que o CSS está importado corretamente

// ✅ Definição correta da tipagem
export interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PageProps) {
  console.log("🚀 Renderizando PostPage...");
  console.log("🔍 Parâmetro `params` recebido:", params);

  if (!params?.slug) {
    console.error("❌ Erro: Nenhum slug encontrado nos parâmetros.");
    return notFound();
  }

  console.log("🔎 Buscando post no banco de dados com slug:", params.slug);
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    console.error("❌ Erro: Nenhum post encontrado para o slug:", params.slug);
    return notFound();
  }

  console.log("✅ Post encontrado:", post);

  return (
    <div>
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

        <article className="markdown-container prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]} // 🔹 Garante segurança e mantém HTML embutido
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
