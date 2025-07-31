#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupNewsletter() {
    console.log('🚀 Configurando sistema de newsletter...\n');

    try {
        // 1. Criar configuração SMTP padrão (desativada)
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

        // 2. Criar alguns inscritos de exemplo
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

        // 3. Criar template padrão
        console.log('📝 Criando template padrão...');
        const existingTemplate = await prisma.newsletterTemplate.findFirst({
            where: { name: 'Template Padrão' },
        });

        if (!existingTemplate) {
            const defaultTemplate = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{postTitle}}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e9ecef;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
              margin-bottom: 10px;
            }
            .post-title {
              font-size: 28px;
              font-weight: bold;
              color: #212529;
              margin-bottom: 20px;
              line-height: 1.3;
            }
            .post-content {
              font-size: 16px;
              line-height: 1.8;
              color: #495057;
              margin-bottom: 30px;
            }
            .read-more {
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin-bottom: 30px;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              font-size: 14px;
              color: #6c757d;
            }
            .unsubscribe {
              color: #6c757d;
              text-decoration: none;
              font-size: 12px;
            }
            .author {
              font-style: italic;
              color: #6c757d;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Tech & Marketing & Business</div>
              <p>Novo artigo publicado!</p>
            </div>

            <h1 class="post-title">{{postTitle}}</h1>
            
            <div class="author">
              Por {{authorName}}
            </div>

            <div class="post-content">
              {{postExcerpt}}
            </div>

            <a href="{{postUrl}}" class="read-more">Ler artigo completo →</a>

            <div class="footer">
              <p>Recebeu este email porque você está inscrito na nossa newsletter.</p>
              <a href="{{unsubscribeUrl}}" class="unsubscribe">Cancelar inscrição</a>
            </div>
          </div>
        </body>
        </html>
      `;

            await prisma.newsletterTemplate.create({
                data: {
                    name: 'Template Padrão',
                    description: 'Template padrão para newsletters',
                    htmlContent: defaultTemplate,
                    isDefault: true,
                    isActive: true,
                    variables: {
                        postTitle: { type: 'string', description: 'Título do post' },
                        postContent: { type: 'string', description: 'Conteúdo do post' },
                        postExcerpt: { type: 'string', description: 'Resumo do post' },
                        postUrl: { type: 'string', description: 'URL do post' },
                        authorName: { type: 'string', description: 'Nome do autor' },
                        unsubscribeUrl: { type: 'string', description: 'URL de cancelamento' },
                    },
                },
            });
            console.log('✅ Template padrão criado\n');
        } else {
            console.log('ℹ️  Template padrão já existe\n');
        }

        console.log('🎉 Configuração da newsletter concluída!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Configure suas credenciais SMTP no painel admin (/admin)');
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