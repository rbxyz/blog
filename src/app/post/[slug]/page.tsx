import { prisma } from "~/server/db";
import Navbar from "~/app/components/Navbar";

// Função para gerar os parâmetros estáticos (geração de páginas dinâmicas)
export async function generateStaticParams() {
  // Busca todos os posts, selecionando apenas o campo slug
  const posts = await prisma.post.findMany({
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

// Componente para a página de post
export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!params?.slug) {
    return <p>Slug não encontrado!</p>;
  }

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    return <p>Post não encontrado!</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="mb-6 h-[720px] w-full rounded-lg object-cover"
          />
        )}
        <h1 className="mb-4 text-3xl font-semibold text-gray-800">
          {post.title}
        </h1>
        <p className="text-gray-600">{post.content}</p>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Autor: {post.name}</span>
          <span>
            Data:{" "}
            {post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : "Data não disponível"}
          </span>
        </div>
        {post.category ? (
          <div className="mt-4">
            <span className="font-semibold">Categoria:</span>
            <a
              href={`/categoria/${post.category.id}`} // ✅ Agora "id" existe
              className="ml-2 rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
            >
              {post.category.name}
            </a>
          </div>
        ) : (
          <p className="mt-4 text-gray-500">Sem categoria</p>
        )}
      </div>
    </div>
  );
}
