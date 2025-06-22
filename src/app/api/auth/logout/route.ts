import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '~/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Obter token do cookie
        const sessionToken = request.cookies.get('session')?.value;

        if (sessionToken) {
            // Remover sessão do banco de dados
            await destroySession(sessionToken);
        }

        // Criar response removendo o cookie
        const response = NextResponse.json(
            { success: true },
            { status: 200 }
        );

        // Remover cookie de sessão
        response.cookies.set('session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0, // Expira imediatamente
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Erro no logout:', error);

        // Mesmo com erro, remover o cookie
        const response = NextResponse.json(
            { success: true },
            { status: 200 }
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
} 