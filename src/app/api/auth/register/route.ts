import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { registerUser } from '~/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z
        .string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    name: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { email: string; password: string; name?: string };

        // Validar dados de entrada
        const validatedData = registerSchema.parse(body);

        // Verificar se é o email do admin para definir role automática
        const isAdminEmail = validatedData.email === 'rbcr4z1@gmail.com';
        const role = isAdminEmail ? 'ADMIN' : 'USER';

        // Registrar usuário
        const result = await registerUser(
            validatedData.email,
            validatedData.password,
            validatedData.name,
            role
        );

        if ('error' in result) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        // Criar response com cookie de sessão
        const response = NextResponse.json(
            {
                success: true,
                user: result.user,
                message: isAdminEmail
                    ? 'Usuário administrador criado com sucesso!'
                    : 'Usuário criado com sucesso!'
            },
            { status: 201 }
        );

        // Definir cookie de sessão (httpOnly para segurança)
        response.cookies.set('session', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 dias
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Erro no registro:', error);

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