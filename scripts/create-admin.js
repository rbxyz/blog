#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

// Interface para entrada de dados
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para fazer perguntas
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Função para esconder senha durante digitação
function questionPassword(prompt) {
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let password = '';

        process.stdin.on('data', function (char) {
            char = char + '';

            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write('\n');
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

// Função principal
async function createAdmin() {
    console.log('🚀 Script para Criar Usuário Admin\n');
    console.log('Este script criará um usuário administrador no sistema.\n');

    try {
        // Verificar se já existe algum admin
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (existingAdmin) {
            console.log('⚠️  Já existe um usuário admin no sistema!');
            console.log(`Admin atual: ${existingAdmin.email} (${existingAdmin.name ?? 'Sem nome'})`);

            const confirm = await question('\nDeseja criar outro admin mesmo assim? (s/N): ');
            if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
                console.log('❌ Operação cancelada.');
                return;
            }
        }

        // Coletar dados do admin
        console.log('\n📝 Dados do novo administrador:\n');

        const name = await question('👤 Nome completo: ');
        if (!name.trim()) {
            throw new Error('Nome é obrigatório!');
        }

        const email = await question('📧 Email: ');
        if (!email.trim() || !email.includes('@')) {
            throw new Error('Email válido é obrigatório!');
        }

        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error(`❌ Usuário com email ${email} já existe!`);
        }

        const password = await questionPassword('🔒 Senha (mín. 6 caracteres): ');
        if (!password || password.length < 6) {
            throw new Error('Senha deve ter pelo menos 6 caracteres!');
        }

        const confirmPassword = await questionPassword('🔒 Confirme a senha: ');
        if (password !== confirmPassword) {
            throw new Error('Senhas não coincidem!');
        }

        console.log('\n⏳ Criando usuário admin...\n');

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Criar o usuário admin
        const admin = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log('✅ Usuário admin criado com sucesso!\n');
        console.log('📋 Detalhes do admin criado:');
        console.log(`   👤 Nome: ${admin.name}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Role: ${admin.role}`);
        console.log(`   📅 Criado em: ${admin.createdAt.toLocaleString('pt-BR')}\n`);

        console.log('🎉 Agora você pode fazer login no painel admin com essas credenciais!');
        console.log('🌐 Acesse: http://localhost:3000/auth/login\n');

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Tratamento de interrupção
process.on('SIGINT', async () => {
    console.log('\n❌ Operação cancelada pelo usuário.');
    rl.close();
    await prisma.$disconnect();
    process.exit(0);
});

// Executar script
createAdmin(); 