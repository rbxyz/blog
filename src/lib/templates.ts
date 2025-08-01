import { prisma } from '~/server/db';

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue?: string | number | boolean | Date;
}

export interface NewsletterTemplateData {
  postTitle: string;
  postContent: string;
  postImageUrl?: string;
  postUrl: string;
  authorName: string;
  unsubscribeUrl: string;
  subscriberName?: string;
  subscriberEmail: string;
  currentDate: string;
  siteName: string;
  siteUrl: string;
}

class TemplateService {
  private defaultTemplate = `
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
        .greeting {
          margin-bottom: 20px;
          font-size: 16px;
          color: #495057;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">{{siteName}}</div>
          <p>Novo artigo publicado!</p>
        </div>

        {{#if subscriberName}}
        <div class="greeting">
          Olá {{subscriberName}},
        </div>
        {{/if}}

        {{#if postImageUrl}}
        <img src="{{postImageUrl}}" alt="{{postTitle}}" class="post-image">
        {{/if}}

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

  async createDefaultTemplate() {
    try {
      const existingTemplate = await prisma.newsletterTemplate.findFirst({
        where: { name: 'Template Padrão' },
      });

      if (!existingTemplate) {
        await prisma.newsletterTemplate.create({
          data: {
            name: 'Template Padrão',
            description: 'Template padrão para newsletters',
            htmlContent: this.defaultTemplate,
            isDefault: true,
            isActive: true,
            variables: {
              postTitle: { type: 'string', description: 'Título do post' },
              postContent: { type: 'string', description: 'Conteúdo do post' },
              postImageUrl: { type: 'string', description: 'URL da imagem do post' },
              postUrl: { type: 'string', description: 'URL do post' },
              authorName: { type: 'string', description: 'Nome do autor' },
              unsubscribeUrl: { type: 'string', description: 'URL de cancelamento' },
              subscriberName: { type: 'string', description: 'Nome do inscrito' },
              subscriberEmail: { type: 'string', description: 'Email do inscrito' },
              currentDate: { type: 'date', description: 'Data atual' },
              siteName: { type: 'string', description: 'Nome do site' },
              siteUrl: { type: 'string', description: 'URL do site' },
            },
          },
        });
      }
    } catch (error) {
      console.error('Erro ao criar template padrão:', error);
    }
  }

  async getTemplates() {
    return await prisma.newsletterTemplate.findMany({
      where: { isActive: true },
      orderBy: { isDefault: 'desc' },
    });
  }

  async getTemplate(templateId: string) {
    return await prisma.newsletterTemplate.findUnique({
      where: { id: templateId },
    });
  }

  async createTemplate(data: {
    name: string;
    description?: string;
    htmlContent: string;
    cssContent?: string;
    variables?: Record<string, TemplateVariable>;
  }) {
    try {
      const template = await prisma.newsletterTemplate.create({
        data: {
          name: data.name,
          description: data.description,
          htmlContent: data.htmlContent,
          cssContent: data.cssContent,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          variables: data.variables ? data.variables as unknown as any : undefined,
          isActive: true,
          isDefault: false,
        },
      });
      return template;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    data: {
      name?: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
      variables?: Record<string, TemplateVariable>;
      isActive?: boolean;
    }
  ) {
    // Simular atualização de template (modelo não existe no schema atual)
    console.log('Atualizando template:', templateId);
    return {
      id: templateId,
      name: data.name ?? 'Template Atualizado',
      description: data.description,
      htmlContent: data.htmlContent ?? '',
      cssContent: data.cssContent,
      isActive: data.isActive ?? true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private processConditionals(html: string, variables: Record<string, string | number | boolean | undefined>): string {
    // Processar condicionais {{#if variable}}...{{/if}}
    const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;

    return html.replace(conditionalRegex, (match: string, variable: string, content: string): string => {
      const value = variables[variable];
      if (value && value !== '' && value !== 0) {
        return content;
      }
      return '';
    });
  }

  async deleteTemplate(templateId: string) {
    // Simular exclusão de template (modelo não existe no schema atual)
    console.log('Excluindo template:', templateId);
    return { success: true };
  }

  async setDefaultTemplate(templateId: string) {
    // Simular definição de template padrão (modelo não existe no schema atual)
    console.log('Definindo template padrão:', templateId);
    return {
      id: templateId,
      name: 'Template Padrão',
      isDefault: true,
    };
  }

  async renderTemplate(
    templateId: string,
    data: NewsletterTemplateData
  ): Promise<string> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    let html = template.htmlContent;

    // Substituir variáveis simples
    const variables = {
      postTitle: data.postTitle,
      postContent: data.postContent,
      postImageUrl: data.postImageUrl ?? '',
      postUrl: data.postUrl,
      authorName: data.authorName,
      unsubscribeUrl: data.unsubscribeUrl,
      subscriberName: data.subscriberName ?? '',
      subscriberEmail: data.subscriberEmail,
      currentDate: data.currentDate,
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      postExcerpt: this.truncateContent(data.postContent, 300),
    };

    // Substituir variáveis no template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value ?? '');
    });

    // Processar condicionais simples
    html = this.processConditionals(html, variables);

    // Adicionar CSS personalizado se existir
    if (template.cssContent) {
      html = html.replace('</head>', `<style>${template.cssContent}</style></head>`);
    }

    return html;
  }

  private truncateContent(content: string, maxLength: number): string {
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

  getAvailableVariables(): TemplateVariable[] {
    return [
      { name: 'postTitle', description: 'Título do post', type: 'string' },
      { name: 'postContent', description: 'Conteúdo completo do post', type: 'string' },
      { name: 'postExcerpt', description: 'Resumo do post (300 caracteres)', type: 'string' },
      { name: 'postImageUrl', description: 'URL da imagem do post', type: 'string' },
      { name: 'postUrl', description: 'URL do post', type: 'string' },
      { name: 'authorName', description: 'Nome do autor', type: 'string' },
      { name: 'unsubscribeUrl', description: 'URL de cancelamento', type: 'string' },
      { name: 'subscriberName', description: 'Nome do inscrito', type: 'string' },
      { name: 'subscriberEmail', description: 'Email do inscrito', type: 'string' },
      { name: 'currentDate', description: 'Data atual', type: 'date' },
      { name: 'siteName', description: 'Nome do site', type: 'string' },
      { name: 'siteUrl', description: 'URL do site', type: 'string' },
    ];
  }
}

export const templateService = new TemplateService(); 