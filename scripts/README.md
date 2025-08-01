# 📋 Scripts do Sistema de Blog

Este diretório contém scripts utilitários para gerenciar o sistema de blog.

## 🕐 Sistema de Agendamento

### Scripts Principais

#### `schedule-posts.js`
Script principal que verifica e publica posts agendados automaticamente.

**Funcionalidades:**
- ✅ Verifica posts agendados que devem ser publicados
- ✅ Publica posts quando a data/hora é atingida
- ✅ Limpa o campo `scheduledAt` após publicação
- ✅ Logs detalhados de todas as operações

**Como usar:**
```bash
# Execução manual
node scripts/schedule-posts.js

# Verificar se há posts para publicar
node scripts/schedule-posts.js
```

#### `test-scheduling.js`
Script para testar o sistema de agendamento.

**Comandos disponíveis:**
```bash
# Criar posts de teste
node scripts/test-scheduling.js create

# Listar posts agendados
node scripts/test-scheduling.js list

# Limpar posts de teste
node scripts/test-scheduling.js cleanup
```

### Configuração Automática

#### `setup-cron.sh`
Script para configurar o cron job automaticamente.

**Como usar:**
```bash
# Configurar cron job (executa a cada 5 minutos)
./scripts/setup-cron.sh
```

**O que faz:**
- ✅ Adiciona entrada no crontab
- ✅ Executa a cada 5 minutos
- ✅ Salva logs em `logs/schedule.log`
- ✅ Evita duplicatas

### Scripts de Debug

#### `debug-post.js`
Script para debugar dados de posts específicos.

**Comandos disponíveis:**
```bash
# Debugar post específico
node scripts/debug-post.js post <slug>

# Listar todos os posts
node scripts/debug-post.js list
```

#### `fix-spotify-posts.js`
Script para corrigir posts com URL do Spotify.

**Comandos disponíveis:**
```bash
# Corrigir posts com Spotify
node scripts/fix-spotify-posts.js fix

# Listar posts com Spotify
node scripts/fix-spotify-posts.js list
```

## 🔧 Configuração do Cron Job

### Configuração Manual
```bash
# Editar crontab
crontab -e

# Adicionar linha (substitua pelo caminho correto)
*/5 * * * * cd /path/to/blog && node scripts/schedule-posts.js >> logs/schedule.log 2>&1
```

### Configuração Automática
```bash
# Executar script de configuração
./scripts/setup-cron.sh
```

## 📊 Monitoramento

### Verificar Logs
```bash
# Ver logs em tempo real
tail -f logs/schedule.log

# Ver últimas 50 linhas
tail -n 50 logs/schedule.log
```

### Verificar Cron Jobs
```bash
# Listar cron jobs ativos
crontab -l

# Verificar se o script está sendo executado
ps aux | grep schedule-posts
```

## 🚨 Solução de Problemas

### Script não executa
1. Verificar se o Node.js está instalado
2. Verificar se o caminho do projeto está correto
3. Verificar permissões do script
4. Verificar logs em `logs/schedule.log`

### Posts não são publicados
1. Verificar se o post tem `scheduledAt` definido
2. Verificar se `published` é `false`
3. Verificar se a data/hora já passou
4. Executar script manualmente para debug

### Erro de módulo ES
Se aparecer erro de ES modules, verificar se o `package.json` tem `"type": "module"`.

## 📝 Exemplos de Uso

### Testar Agendamento
```bash
# 1. Criar posts de teste
node scripts/test-scheduling.js create

# 2. Listar posts agendados
node scripts/test-scheduling.js list

# 3. Aguardar 5 minutos e verificar se foram publicados
node scripts/schedule-posts.js

# 4. Limpar posts de teste
node scripts/test-scheduling.js cleanup
```

### Debug de Post
```bash
# Debugar post específico
node scripts/debug-post.js post meu-post-slug

# Verificar condições do Spotify
node scripts/fix-spotify-posts.js list
```

## 🔄 Manutenção

### Atualizar Scripts
Os scripts são atualizados automaticamente quando você faz pull do repositório.

### Backup de Configuração
```bash
# Fazer backup do crontab
crontab -l > backup-crontab.txt

# Restaurar crontab
crontab backup-crontab.txt
```

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs em `logs/schedule.log`
2. Executar scripts manualmente para debug
3. Verificar configuração do cron job
4. Consultar documentação do projeto 