import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomBytes } from "crypto"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Gerar ID de sessão único para visitantes não autenticados
export function generateSessionId(): string {
    return randomBytes(16).toString('hex');
}

// Extrair informações do request para identificação de usuário
export function extractUserInfo(request: Request): {
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
} {
    const headers = request.headers;
    const userAgent = headers.get('user-agent') ?? undefined;

    // Tentar obter IP real (considerando proxies)
    let ipAddress: string | undefined;
    const forwardedFor = headers.get('x-forwarded-for');
    const realIp = headers.get('x-real-ip');

    if (forwardedFor) {
        const firstIp = forwardedFor.split(',')[0];
        if (firstIp) {
            ipAddress = firstIp.trim();
        }
    } else if (realIp) {
        ipAddress = realIp;
    }

    // Gerar sessionId baseado em headers para consistência
    const sessionId = generateSessionId();

    return {
        sessionId,
        ipAddress,
        userAgent,
    };
}

// Verificar se uma visualização já foi registrada
export async function hasViewedPost(
    postId: string,
    sessionId: string,
    userId?: string
): Promise<boolean> {
    const { prisma } = await import("~/server/db");

    const existingView = await prisma.postView.findFirst({
        where: {
            postId,
            sessionId,
            ...(userId && { userId }),
        },
    });

    return !!existingView;
}

// Registrar uma nova visualização
export async function recordPostView(
    postId: string,
    sessionId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    const { prisma } = await import("~/server/db");

    try {
        // Usar transação para garantir consistência
        await prisma.$transaction(async (tx) => {
            // Verificar se já existe uma visualização para esta sessão
            const existingView = await tx.postView.findFirst({
                where: {
                    postId,
                    sessionId,
                    ...(userId && { userId }),
                },
            });

            if (existingView) {
                console.log('Visualização já registrada para esta sessão');
                return;
            }

            // Criar nova visualização
            await tx.postView.create({
                data: {
                    postId,
                    sessionId,
                    userId,
                    ipAddress,
                    userAgent,
                },
            });

            // Atualizar o contador total de visualizações
            await tx.post.update({
                where: { id: postId },
                data: { viewCount: { increment: 1 } },
            });

            console.log('Nova visualização registrada com sucesso');
        });
    } catch (error) {
        console.error('Erro ao registrar visualização:', error);
    }
}

export function stripMarkdown(text: string): string {
    if (!text) return '';

    return text
        // Remove headers (# ## ### etc)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic (**text** *text*)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove inline code (`code`)
        .replace(/`([^`]+)`/g, '$1')
        // Remove links ([text](url))
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images (![alt](url))
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Remove code blocks (```code```)
        .replace(/```[\s\S]*?```/g, '')
        // Remove blockquotes (> text)
        .replace(/^>\s+/gm, '')
        // Remove lists (- item, * item, 1. item)
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Remove multiple line breaks
        .replace(/\n\s*\n/g, '\n')
        // Remove extra whitespace
        .replace(/^\s+|\s+$/g, '')
        .trim();
}

export function createExcerpt(text: string, maxLength = 150): string {
    const cleanText = stripMarkdown(text);

    if (cleanText.length <= maxLength) {
        return cleanText;
    }

    // Find the last complete sentence within the limit
    const truncated = cleanText.slice(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSentence > maxLength * 0.7) {
        return cleanText.slice(0, lastSentence + 1);
    }

    if (lastSpace > maxLength * 0.8) {
        return cleanText.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
} 