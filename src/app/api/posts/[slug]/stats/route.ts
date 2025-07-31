import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Buscar o post com estatísticas
        const post = await prisma.post.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                viewCount: true,
                views: {
                    select: {
                        id: true,
                        createdAt: true,
                        userId: true,
                        sessionId: true,
                        ipAddress: true,
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post não encontrado' },
                { status: 404 }
            );
        }

        // Calcular estatísticas
        const totalViews = post.viewCount;
        const uniqueViews = post.views.length;
        const authenticatedViews = post.views.filter(view => view.userId).length;
        const anonymousViews = uniqueViews - authenticatedViews;

        // Agrupar por data (últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentViews = post.views.filter(view =>
            new Date(view.createdAt) >= sevenDaysAgo
        );

        // Agrupar por IP (para detectar possíveis bots)
        const ipGroups = post.views.reduce((acc, view) => {
            if (view.ipAddress) {
                acc[view.ipAddress] = (acc[view.ipAddress] ?? 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const suspiciousIPs = Object.entries(ipGroups)
            .filter(([_, count]) => count > 5)
            .map(([ip, count]) => ({ ip, count }));

        return NextResponse.json({
            success: true,
            data: {
                post: {
                    id: post.id,
                    title: post.title,
                    slug,
                },
                statistics: {
                    totalViews,
                    uniqueViews,
                    authenticatedViews,
                    anonymousViews,
                    recentViews: recentViews.length,
                    suspiciousIPs,
                },
                views: post.views.map(view => ({
                    id: view.id,
                    createdAt: view.createdAt,
                    isAuthenticated: !!view.userId,
                    sessionId: view.sessionId,
                    ipAddress: view.ipAddress,
                })),
            },
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 