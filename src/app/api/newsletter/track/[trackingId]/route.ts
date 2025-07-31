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

        // Atualizar estatísticas de abertura
        await prisma.newsletterEmailLog.update({
            where: { id: emailLog.id },
            data: {
                status: EmailStatus.OPENED,
                openedAt: new Date(),
                lastOpenedAt: new Date(),
                openCount: {
                    increment: 1,
                },
            },
        });

        // Retornar pixel transparente 1x1
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'base64'
        );

        return new NextResponse(pixel, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Erro no tracking de abertura:', error);
        return new NextResponse('Erro interno', { status: 500 });
    }
} 