import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractUserInfo, recordPostView } from "~/lib/utils";

export function middleware(request: NextRequest) {
  // Verificar se é uma requisição para uma página de post
  const regex = /^\/post\/([^\/]+)$/;
  const postMatch = regex.exec(request.nextUrl.pathname);

  if (postMatch && postMatch[1]) {
    const slug = postMatch[1];

    // Extrair informações do usuário
    const userInfo = extractUserInfo(request);

    // Processar visualização de forma assíncrona (não bloquear a resposta)
    void processViewAsync(slug, userInfo, request);
  }

  return NextResponse.next();
}

// Função assíncrona para processar visualização sem bloquear a resposta
async function processViewAsync(
  slug: string,
  userInfo: { sessionId: string; ipAddress?: string; userAgent?: string },
  _request: NextRequest
) {
  try {
    const { prisma } = await import("~/server/db");

    // Buscar o post pelo slug
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) return;

    // Verificar se já existe uma visualização para esta sessão
    const existingView = await prisma.postView.findFirst({
      where: {
        postId: post.id,
        sessionId: userInfo.sessionId,
      },
    });

    if (existingView) {
      console.log('Visualização já registrada para esta sessão');
      return;
    }

    // Registrar nova visualização
    await recordPostView(
      post.id,
      userInfo.sessionId,
      undefined, // userId será undefined para visitantes não autenticados
      userInfo.ipAddress,
      userInfo.userAgent
    );

    console.log('Nova visualização registrada:', { slug, sessionId: userInfo.sessionId });
  } catch (error) {
    console.error('Erro ao processar visualização:', error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
