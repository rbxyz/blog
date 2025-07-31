import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { extractUserInfo, recordPostView } from '~/lib/utils';
import { validateSession } from '~/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Buscar o post
        const post = await prisma.post.findUnique({
            where: { slug },
            select: { id: true, title: true },
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            );
        }

        // Extrair informações do usuário
        const userInfo = extractUserInfo(request);

        // Verificar se o usuário está autenticado
        const cookieStore = request.cookies;
        const sessionToken = cookieStore.get('session')?.value;
        const user = sessionToken ? await validateSession(sessionToken) : null;

        // Verificar se já existe uma visualização para esta sessão
        const existingView = await prisma.postView.findFirst({
            where: {
                postId: post.id,
                sessionId: userInfo.sessionId,
                ...(user && { userId: user.id }),
            },
        });

        if (existingView) {
            return NextResponse.json(
                { message: 'Visualização já registrada' },
                { status: 200 }
            );
        }

        // Registrar nova visualização
        await recordPostView(
            post.id,
            userInfo.sessionId,
            user?.id,
            userInfo.ipAddress,
            userInfo.userAgent
        );

        // Buscar o contador atualizado
        const updatedPost = await prisma.post.findUnique({
            where: { id: post.id },
            select: { viewCount: true },
        });

        return NextResponse.json({
            success: true,
            message: 'Visualização registrada com sucesso',
            viewCount: updatedPost?.viewCount ?? 0,
        });

    } catch (error) {
        console.error('Erro ao registrar visualização:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 