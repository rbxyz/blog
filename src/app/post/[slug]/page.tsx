import { prisma } from "~/server/db"; // Certifique-se de que o caminho está correto
import { notFound } from "next/navigation";

// Função para gerar os parâmetros estáticos (geração de páginas dinâmicas)
export async function generateStaticParams() {
  // Busca todos os posts, selecionando apenas o campo slug
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });
  console.log("Slugs encontrados no banco:", posts);

  // Retorna os parâmetros para cada post
  return posts.map((post) => ({ slug: post.slug }));
}

// Componente para a página de post
export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  console.log("Slug recebido na URL:", slug);

  // Busca o post pelo slug
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  console.log("Post encontrado:", post);

  // Se o post não for encontrado, dispara a página 404
  if (!post) {
    console.log("Post não encontrado para o slug:", slug);
    notFound();
  }

  // Renderiza o conteúdo do post
  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-3xl font-semibold text-gray-800">
        {post.title}
      </h1>
      <p className="text-gray-600">{post.content}</p>
      <small>Autor: {post.name}</small>
      <div>
        <span>
          Data:{" "}
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString()
            : "Data não disponível"}
        </span>
      </div>
    </div>
  );
}
