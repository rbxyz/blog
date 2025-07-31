import type { Metadata } from "next";
import { prisma } from "~/server/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Clock, Share2 } from "lucide-react";
import { cookies } from "next/headers";
import { validateSession } from "~/lib/auth";
import Comments from "~/app/components/Comments";
import ShareButton from "~/app/components/ShareButton";
import ViewTracker from "~/app/components/ViewTracker";
import AboutMe from "~/app/components/AboutMe";
import AudioPlayer from "~/app/components/AudioPlayer";
import SpotifyPlaylist from "~/app/components/SpotifyPlaylist";
import "~/styles/markdown.css";

// ✅ Corrigindo a tipagem do `params`
type PageParams = Promise<{ slug: string }>;

export default async function PostPage({ params }: { params: PageParams }) {
  const { slug } = await params; // 🔹 Aguarda o `params` ser resolvido corretamente
  if (!slug) return notFound();

  const post = await prisma.post.findUnique({ 
    where: { slug },
    include: {
      views: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  if (!post) return notFound();

  // Verificar autenticação do usuário
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const user = sessionToken ? await validateSession(sessionToken) : null;

  // Estimativa de tempo de leitura (250 palavras por minuto)
  const wordCount = post.content?.split(' ').length ?? 0;
  const readingTime = Math.ceil(wordCount / 250);

  return (
    <div className="min-h-screen">
      {/* View Tracker - Componente invisível para rastrear visualizações */}
      <ViewTracker slug={post.slug} />
      
      {/* Hero Section */}
      <section className="relative py-12 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/"
            className="group inline-flex items-center space-x-2 glass-card rounded-xl px-4 py-2 mb-8 hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors group-hover:-translate-x-1" />
            <span className="text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Voltar aos posts
            </span>
          </Link>

          {/* Post header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-800 dark:text-slate-100 leading-tight">
              {post.title}
            </h1>

            {/* Meta information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString('pt-BR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de leitura</span>
              </div>
              
              {post.viewCount !== undefined && (
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount} visualizações</span>
                </div>
              )}

              <ShareButton slug={post.slug} title={post.title} />
            </div>
          </div>

          {/* Audio Player */}
          {post.hasAudio && post.audioUrl && (
            <div className="mb-8">
              <AudioPlayer
                audioUrl={post.audioUrl}
                title={post.title}
                duration={post.audioDuration ?? undefined}
              />
            </div>
          )}

          {/* Featured image */}
          {post.imageUrl && (
            <div className="relative mb-12 group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src={post.imageUrl}
                alt={post.title}
                className="relative w-full max-w-4xl mx-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Post content */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Audio Player Sidebar */}
              {post.hasAudio && post.audioUrl && (
                <div className="sticky top-8">
                  <AudioPlayer
                    audioUrl={post.audioUrl}
                    title={post.title}
                    duration={post.audioDuration ?? undefined}
                    className="mb-6"
                  />
                </div>
              )}

              {/* Spotify Playlist */}
              {post.spotifyPlaylistUrl && (
                <SpotifyPlaylist
                  playlistUrl={post.spotifyPlaylistUrl}
                  className="sticky top-8"
                />
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="glass-card rounded-3xl p-8 md:p-12">
            <div className="markdown-container prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 mt-8 pb-2 border-b border-slate-200/20 dark:border-slate-700/20">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none mb-6 space-y-2">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start space-x-3 text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-primary-500 mt-3 flex-shrink-0"></span>
                      <span>{children}</span>
                    </li>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-6 space-y-2 text-slate-700 dark:text-slate-300">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-500 pl-6 py-2 my-6 glass-card rounded-r-xl italic text-slate-600 dark:text-slate-400">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-mono text-sm">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto font-mono text-sm leading-relaxed">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="mb-6 rounded-xl overflow-hidden shadow-lg">
                      {children}
                    </pre>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium underline-offset-4 hover:underline transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }) => (
                    <div className="my-8 text-center">
                      <img 
                        src={src} 
                        alt={alt ?? 'Imagem'}
                        className="rounded-xl shadow-lg max-w-full mx-auto block"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                      {alt && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">
                          {alt}
                        </p>
                      )}
                    </div>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>

      {/* Call to action */}
          <div className="mt-12 text-center">
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                Gostou do artigo?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Compartilhe com seus amigos e explore mais conteúdos incríveis!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg group-hover:shadow-glow"></div>
                  <span className="relative z-10 text-white flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </span>
                </button>
                
                <Link 
                  href="/"
                  className="glass-card rounded-xl px-6 py-3 font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105 text-slate-700 dark:text-slate-300"
                >
                  Ver mais posts
                </Link>
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="mt-12">
            <AboutMe />
          </div>

          {/* Comments Section */}
          <Comments postId={post.id} user={user} />
        </div>
      </section>
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
    select: { title: true, content: true, imageUrl: true },
  });

  if (!post) {
    return {
      title: "Post não encontrado",
      description: "O post solicitado não foi encontrado.",
    };
  }

  const description = post.content 
    ? post.content.slice(0, 160).replace(/[#*`]/g, '') + "..."
    : `Leia ${post.title} no Tech & Marketing & Business.`;

  return {
    title: `${post.title} | Tech & Marketing & Business`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      images: post.imageUrl ? [{ url: post.imageUrl, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}
