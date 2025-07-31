import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authenticateUser } from '~/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { email: string; password: string };
        console.log('🔍 Login attempt:', { email: body.email, hasPassword: !!body.password });

        // Validar dados de entrada
        const validatedData = loginSchema.parse(body);
        console.log('✅ Validation passed');

        // Autenticar usuário
        console.log('🔐 Calling authenticateUser...');
        const result = await authenticateUser(validatedData.email, validatedData.password);
        console.log('🔍 Authentication result:', result ? 'SUCCESS' : 'FAIL');

        if (!result) {
            console.log('❌ Authentication failed');
            return NextResponse.json(
                { error: 'E-mail ou senha incorretos' },
                { status: 401 }
            );
        }

        console.log('✅ Authentication successful, creating response...');

        // Criar response com cookie de sessão
        const response = NextResponse.json(
            {
                success: true,
                user: result.user
            },
            { status: 200 }
        );

        // Definir cookie de sessão (httpOnly para segurança)
        response.cookies.set('session', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 dias
            path: '/',
        });

        console.log('🍪 Cookie set, returning response');
        return response;
    } catch (error) {
        console.error('💥 Error in login:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0]?.message ?? 'Dados inválidos' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 