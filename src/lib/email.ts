import nodemailer from 'nodemailer';
import { prisma } from '~/server/db';
import type { EmailType, EmailStatus } from '@prisma/client';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface NewsletterData {
  postTitle: string;
  postContent: string;
  postImageUrl?: string;
  postUrl: string;
  authorName: string;
  unsubscribeUrl: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  async initialize() {
    try {
      const smtpConfig = await prisma.smtpConfig.findFirst({
        where: { isActive: true },
      });

      if (!smtpConfig) {
        console.log('Nenhuma configuração SMTP ativa encontrada');
        return false;
      }

      this.config = {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        password: smtpConfig.password,
        fromEmail: smtpConfig.fromEmail,
        fromName: smtpConfig.fromName,
      };

      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.username,
          pass: this.config.password,
        },
      });

      // Verificar conexão
      await this.transporter.verify();
      console.log('✅ Serviço de email inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de email:', error);
      return false;
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('Serviço de email não inicializado');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      const info = await this.transporter.sendMail(mailOptions) as { messageId?: string };
      console.log('✅ Email enviado:', info.messageId ?? 'ID não disponível');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  generateNewsletterHTML(data: NewsletterData): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.postTitle}</title>
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
          .post-image {
            width: 100%;
            max-width: 500px;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
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
            <div class="logo">📝 Tech & Marketing & Business</div>
            <p>Novo artigo publicado!</p>
          </div>

          ${data.postImageUrl ? `<img src="${data.postImageUrl}" alt="${data.postTitle}" class="post-image">` : ''}

          <h1 class="post-title">${data.postTitle}</h1>
          
          <div class="author">
            Por ${data.authorName}
          </div>

          <div class="post-content">
            ${this.truncateContent(data.postContent, 300)}
          </div>

          <a href="${data.postUrl}" class="read-more">Ler artigo completo →</a>

          <div class="footer">
            <p>Recebeu este email porque você está inscrito na nossa newsletter.</p>
            <a href="${data.unsubscribeUrl}" class="unsubscribe">Cancelar inscrição</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeHTML(subscriberName?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo à Newsletter!</title>
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
            text-align: center;
          }
          .welcome-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .welcome-title {
            font-size: 28px;
            font-weight: bold;
            color: #212529;
            margin-bottom: 20px;
          }
          .welcome-text {
            font-size: 16px;
            line-height: 1.8;
            color: #495057;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="welcome-icon">🎉</div>
          <h1 class="welcome-title">Bem-vindo à Newsletter!</h1>
          <p class="welcome-text">
            ${subscriberName ? `Olá ${subscriberName},` : 'Olá!'}<br><br>
            Obrigado por se inscrever na nossa newsletter! Você receberá atualizações sobre novos artigos, 
            dicas de tecnologia e muito mais.<br><br>
            Fique atento ao seu email para não perder nenhum conteúdo interessante!
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private truncateContent(content: string, maxLength: number): string {
    // Remover markdown e HTML tags
    const plainText = content
      .replace(/[#*`]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength) + '...';
  }

  async logEmail(
    subscriberId: string,
    emailType: EmailType,
    status: EmailStatus,
    postId?: string,
    error?: string
  ) {
    try {
      const emailLog = await prisma.newsletterEmailLog.create({
        data: {
          subscriberId,
          postId,
          emailType,
          status,
          error,
        },
      });

      return emailLog;
    } catch (error) {
      console.error('Erro ao registrar log de email:', error);
      return null;
    }
  }

  // Adicionar tracking pixel e links rastreados ao HTML
  addTrackingToHTML(html: string, trackingId: string, baseUrl: string): string {
    // Adicionar pixel de tracking
    const trackingPixel = `<img src="${baseUrl}/api/newsletter/track/${trackingId}" width="1" height="1" style="display:none;" alt="" />`;

    // Substituir links por versões rastreadas
    const trackedHtml = html.replace(
      /<a\s+href="([^"]+)"([^>]*)>/gi,
      (match, url: string, attributes: string) => {
        if (url.startsWith('http') && !url.includes('/api/newsletter/')) {
          const trackedUrl = `${baseUrl}/api/newsletter/click/${trackingId}?url=${encodeURIComponent(url)}`;
          return `<a href="${trackedUrl}"${attributes}>`;
        }
        return match;
      }
    );

    // Adicionar pixel no final do body
    return trackedHtml.replace('</body>', `${trackingPixel}</body>`);
  }
}

export const emailService = new EmailService(); 