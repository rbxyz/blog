import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validateSession } from '~/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Obter token do cookie
        const sessionToken = request.cookies.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Validar sessão
        const user = await validateSession(sessionToken);

        if (!user) {
            // Remover cookie inválido
            const response = NextResponse.json(
                { error: 'Sessão inválida' },
                { status: 401 }
            );

            response.cookies.set('session', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 0,
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { user },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 