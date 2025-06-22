import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '~/server/db';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms

// Tipos
export interface SessionUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar: string | null;
}

export interface AuthSession {
    user: SessionUser;
    expires: Date;
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Gerar token JWT
export async function generateToken(payload: any): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const alg = 'HS256';

    return await new SignJWT(payload)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
}

// Verificar token JWT
export async function verifyToken(token: string): Promise<any> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

// Criar sessão no banco
export async function createSession(userId: string, email: string, role: string): Promise<string> {
    const token = await generateToken({ userId, email, role });
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt,
        },
    });

    return token;
}

// Validar sessão
export async function validateSession(token: string): Promise<SessionUser | null> {
    try {
        // Verificar token JWT
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return null;
        }

        // Verificar se a sessão existe no banco
        const session = await prisma.session.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        avatar: true,
                    },
                },
            },
        });

        // Verificar se a sessão existe e não expirou
        if (!session || session.expiresAt < new Date()) {
            // Limpar sessão expirada
            if (session) {
                await prisma.session.delete({ where: { id: session.id } });
            }
            return null;
        }

        return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            avatar: session.user.avatar,
        };
    } catch (error) {
        console.error('Erro ao validar sessão:', error);
        return null;
    }
}

// Encerrar sessão
export async function destroySession(token: string): Promise<void> {
    try {
        await prisma.session.delete({
            where: { token },
        });
    } catch (error) {
        // Sessão já pode ter sido removida
        console.error('Erro ao encerrar sessão:', error);
    }
}

// Limpar sessões expiradas
export async function cleanExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}

// Autenticar usuário (login)
export async function authenticateUser(
    email: string,
    password: string
): Promise<{ user: SessionUser; token: string } | null> {
    try {
        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return null;
        }

        // Verificar senha
        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        // Criar sessão
        const token = await createSession(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
            token,
        };
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return null;
    }
}

// Registrar usuário
export async function registerUser(
    email: string,
    password: string,
    name?: string,
    role: Role = Role.USER
): Promise<{ user: SessionUser; token: string } | { error: string }> {
    try {
        // Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'E-mail já está cadastrado' };
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                isVerified: true, // Auto-verificar para simplicidade
            }
        });

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Criar sessão no banco
        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            }
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            },
            token
        };
    } catch (error) {
        console.error('Erro no registro:', error);
        return { error: 'Erro interno do servidor' };
    }
}

// Middleware para verificar autenticação
export async function requireAuth(token?: string): Promise<SessionUser | null> {
    if (!token) {
        return null;
    }

    return await validateSession(token);
}

// Verificar se é admin
export function isAdmin(user: SessionUser): boolean {
    return user.role === 'ADMIN';
}

// Verificar se pode editar (admin ou editor)
export function canEdit(user: SessionUser): boolean {
    return user.role === 'ADMIN' || user.role === 'EDITOR';
}

// Validar apenas JWT (para usar no middleware Edge Runtime)
export async function validateJWT(token: string): Promise<{ userId: string; email: string; role: string } | null> {
    try {
        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return null;
        }

        // Retornar apenas os dados do JWT, sem consultar o banco
        return {
            userId: payload.userId,
            email: payload.email || '',
            role: payload.role || 'USER'
        };
    } catch (error) {
        console.error('Erro ao validar JWT:', error);
        return null;
    }
} 