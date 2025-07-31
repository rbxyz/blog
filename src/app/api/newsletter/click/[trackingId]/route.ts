import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { EmailStatus } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { trackingId: string } }
) {
    try {
        const { trackingId } = params;
        const { searchParams } = new URL(request.url);
        const redirectUrl = searchParams.get('url');

        if (!redirectUrl) {
            return new NextResponse('URL de redirecionamento não fornecida', { status: 400 });
        }

        // Buscar o log de email pelo tracking ID
        const emailLog = await prisma.newsletterEmailLog.findUnique({
            where: { trackingId },
            include: {
                subscriber: true,
                post: true,
            },
        });

        if (!emailLog) {
            return new NextResponse('Email não encontrado', { status: 404 });
        }

        // Atualizar estatísticas de clique
        await prisma.newsletterEmailLog.update({
            where: { id: emailLog.id },
            data: {
                status: EmailStatus.CLICKED,
                clickedAt: new Date(),
                lastClickedAt: new Date(),
                clickCount: {
                    increment: 1,
                },
            },
        });

        // Log do clique para análise
        console.log(`Clique registrado: ${emailLog.subscriber.email} -> ${redirectUrl}`);

        // Redirecionar para a URL original
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('Erro no tracking de clique:', error);
        return new NextResponse('Erro interno', { status: 500 });
    }
} 