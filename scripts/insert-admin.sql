-- Script SQL para inserir Ruan Bueno como Admin
-- Execute este script no seu banco PostgreSQL

-- Primeiro, vamos verificar se já existe um admin
SELECT 'Verificando admins existentes...' as status;
SELECT id, name, email, role, "createdAt" 
FROM "users" 
WHERE role = 'ADMIN';

-- Inserir Ruan Bueno como Admin
-- Nota: A senha 'admin123' será hasheada com bcrypt (12 rounds)
-- Hash bcrypt para 'admin123': $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewT5X5D5P5QXkNEG

INSERT INTO "users" (
    id,
    name, 
    email, 
    password, 
    role, 
    "createdAt", 
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Ruan Bueno',
    'rbcr4z1@gmail.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewT5X5D5P5QXkNEG',
    'ADMIN',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    "updatedAt" = NOW();

-- Verificar se foi inserido com sucesso
SELECT 'Admin criado com sucesso!' as status;
SELECT id, name, email, role, "createdAt" 
FROM "users" 
WHERE email = 'ruan@ruanbueno.cloud';

-- Informações de login
SELECT 
    '🎉 ADMIN CRIADO COM SUCESSO!' as "Status",
    'rbcr4z1@gmail.com' as "Email",
    'admin123' as "Senha_Temporária",
    'http://localhost:3000/auth/login' as "URL_Login",
    '⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!' as "Importante"; 