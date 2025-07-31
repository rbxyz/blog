#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { emailService } from '../src/lib/email.ts';
import { templateService } from '../src/lib/templates.ts';

const prisma = new PrismaClient();

async function setupNewsletter() {
    console.log('🚀 Configurando sistema de newsletter...\n');

    try {
        // 1. Criar template padrão
        console.log('📝 Criando template padrão...');
        await templateService.createDefaultTemplate();
        console.log('✅ Template padrão criado\n');

        // 2. Criar configuração SMTP padrão (desativada)
        console.log('📧 Criando configuração SMTP padrão...');
        const existingSmtp = await prisma.smtpConfig.findFirst();

        if (!existingSmtp) {
            await prisma.smtpConfig.create({
                data: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    username: 'seu-email@gmail.com',
                    password: 'sua-senha-de-app',
                    fromEmail: 'seu-email@gmail.com',
                    fromName: 'Blog Ruan',
                    isActive: false,
                },
            });
            console.log('✅ Configuração SMTP padrão criada (desativada)\n');
        } else {
            console.log('ℹ️  Configuração SMTP já existe\n');
        }

        // 3. Criar alguns inscritos de exemplo
        console.log('👥 Criando inscritos de exemplo...');
        const existingSubscribers = await prisma.newsletterSubscriber.count();

        if (existingSubscribers === 0) {
            await prisma.newsletterSubscriber.createMany({
                data: [
                    {
                        email: 'exemplo1@email.com',
                        name: 'João Silva',
                        source: 'setup-script',
                    },
                    {
                        email: 'exemplo2@email.com',
                        name: 'Maria Santos',
                        source: 'setup-script',
                    },
                ],
            });
            console.log('✅ Inscritos de exemplo criados\n');
        } else {
            console.log(`ℹ️  Já existem ${existingSubscribers} inscritos\n`);
        }

        // 4. Testar conexão com email (se configurado)
        console.log('🧪 Testando serviço de email...');
        const smtpConfig = await prisma.smtpConfig.findFirst({
            where: { isActive: true },
        });

        if (smtpConfig) {
            const emailInitialized = await emailService.initialize();
            if (emailInitialized) {
                console.log('✅ Serviço de email funcionando\n');
            } else {
                console.log('⚠️  Serviço de email não conseguiu inicializar\n');
            }
        } else {
            console.log('ℹ️  Nenhuma configuração SMTP ativa encontrada\n');
        }

        console.log('🎉 Configuração da newsletter concluída!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Configure suas credenciais SMTP no painel admin');
        console.log('2. Ative a configuração SMTP');
        console.log('3. Teste o envio de newsletter');
        console.log('4. Configure o Redis se quiser usar o sistema de filas');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

setupNewsletter(); 