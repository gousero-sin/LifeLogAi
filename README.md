# LifeLog IA - Life Goes On A.I. 📖

Seu diário inteligente que entende sua vida, analisa padrões e te ajuda a viver melhor.

## 🌟 Visão Geral

O **LifeLog IA** é um diário inteligente de uso diário que registra sua vida em texto livre, números (humor, sono, energia etc.) e contexto (tags), utilizando IA (DeepSeek) para transformar esses dados em:

- Resumos claros do seu dia
- Planos práticos para o amanhã
- Análises de padrões semanais e mensais
- Insights personalizados sobre humor, rotina, saúde, estudo, trabalho, jogos e relações pessoais

## 🔗 URLs

- **Sandbox (desenvolvimento)**: https://3000-i34ti7dufebetgh8ogpnw-3844e1b6.sandbox.novita.ai
- **API Health Check**: https://3000-i34ti7dufebetgh8ogpnw-3844e1b6.sandbox.novita.ai/api/health

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação
- [x] Registro de usuário
- [x] Login com JWT
- [x] Sessão persistente

### 📝 Registro Diário
- [x] Campo de texto livre
- [x] Humor (0-10 com emojis)
- [x] Energia (0-10)
- [x] Sono (horas + qualidade)
- [x] Estresse (0-10)
- [x] Foco (0-10)
- [x] Momento marcante do dia
- [x] Entradas favoritas
- [x] Entradas privadas (não processadas pela IA)

### 🏷️ Sistema de Tags
- [x] Tags pré-definidas do sistema:
  - Saúde, Faculdade, Estágio, Trabalho
  - Família, Amor, Jogos, Espiritualidade
  - Lazer, Ansiedade, Conquista, Exercício
- [x] Tags personalizáveis pelo usuário

### 🤖 Integração com IA (DeepSeek)
- [x] Configuração de API key nas configurações
- [x] Teste de validade da API key
- [x] Geração de resumo do dia
- [x] Insights emocionais e contextuais
- [x] Plano para o dia seguinte
- [x] Detecção de emoções
- [x] Resumo semanal inteligente
- [x] Busca semântica

### 📊 Dashboard & Analytics
- [x] Estatísticas de período (7, 14, 30 dias)
- [x] Humor médio, energia média, sono médio
- [x] Streak de dias consecutivos
- [x] Gráfico de humor ao longo do tempo
- [x] Gráfico de horas de sono
- [x] Tags mais utilizadas

### 📅 Timeline
- [x] Visualização de todas as entradas
- [x] Ordenação por data
- [x] Indicadores de favoritos e privados

### ⚙️ Configurações
- [x] Configuração de API key da DeepSeek
- [x] Profundidade de análise da IA (rasa, média, profunda)
- [x] Modo discreto (oculta textos sensíveis)
- [x] Informações da conta

## 🗄️ Arquitetura de Dados

### Banco de Dados (Cloudflare D1)

```sql
-- Tabelas principais
users              -- Usuários do sistema
user_settings      -- Configurações (API key, preferências)
entries            -- Entradas diárias do diário
tags               -- Tags do sistema e personalizadas
entry_tags         -- Relacionamento entrada-tag
ai_insights        -- Insights gerados pela IA
entry_emotions     -- Emoções detectadas por entrada
```

### Modelos de Dados

- **User**: id, email, name, password_hash, timestamps
- **Entry**: id, user_id, entry_date, content, mood, energy, sleep_hours, sleep_quality, stress, focus, highlight, is_private, is_favorite
- **Tag**: id, user_id, name, color, icon, is_system
- **AIInsight**: id, user_id, entry_id, insight_type, content, metadata

## 🛣️ Rotas da API

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

### Entradas
- `GET /api/entries` - Listar entradas (com filtros)
- `GET /api/entries/:id` - Obter entrada específica
- `GET /api/entries/date/:date` - Obter entrada por data
- `POST /api/entries` - Criar/atualizar entrada
- `POST /api/entries/:id/insights` - Gerar insights com IA
- `PATCH /api/entries/:id/favorite` - Alternar favorito
- `DELETE /api/entries/:id` - Excluir entrada

### Tags
- `GET /api/tags` - Listar todas as tags
- `POST /api/tags` - Criar tag personalizada
- `PATCH /api/tags/:id` - Atualizar tag
- `DELETE /api/tags/:id` - Excluir tag
- `GET /api/tags/stats` - Estatísticas de uso

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/weekly-summary` - Resumo semanal
- `POST /api/dashboard/search` - Busca semântica
- `GET /api/dashboard/heatmap` - Dados para heatmap
- `GET /api/dashboard/emotions` - Resumo de emoções

### Configurações
- `GET /api/settings` - Obter configurações
- `PATCH /api/settings` - Atualizar configurações
- `POST /api/settings/test-api-key` - Testar API key
- `DELETE /api/settings/api-key` - Remover API key

## 📱 Guia de Uso

### 1. Criar Conta
1. Acesse a aplicação
2. Clique em "Criar conta"
3. Preencha nome, email e senha
4. Pronto! Você já pode começar

### 2. Registrar seu Dia
1. Clique no botão "+" ou "Registrar agora"
2. Selecione seu humor com os emojis
3. Ajuste os sliders de energia, estresse, sono e foco
4. Adicione tags relevantes
5. Escreva sobre seu dia (opcional)
6. Salve a entrada

### 3. Configurar a IA
1. Vá em Configurações (ícone de engrenagem)
2. Cole sua API key da DeepSeek
3. Clique em "Testar" para verificar
4. Salve a configuração
5. Agora você pode gerar insights nas suas entradas!

### 4. Gerar Insights
1. Abra uma entrada existente
2. Clique em "Gerar" na seção de Insights da IA
3. A IA analisará sua entrada e histórico recente
4. Você receberá: resumo, insights e plano para amanhã

## 🚀 Funcionalidades Futuras

- [ ] Módulo Saúde/Bariátrica
- [ ] Módulo Gamer/Performance
- [ ] Módulo Estudo/TCC
- [ ] Notificações inteligentes
- [ ] Relatórios mensais em PDF
- [ ] Modo poético de narrativa
- [ ] Backup e exportação de dados
- [ ] Autenticação biométrica
- [ ] Criptografia de ponta a ponta

## 🛠️ Stack Tecnológica

- **Frontend**: HTML5, TailwindCSS, JavaScript vanilla
- **Backend**: Hono Framework
- **Banco de Dados**: Cloudflare D1 (SQLite)
- **Plataforma**: Cloudflare Pages/Workers
- **IA**: DeepSeek API
- **Charts**: Chart.js
- **Datas**: Day.js

## 📋 Deployment

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Build
npm run build

# Aplicar migrações
npm run db:migrate:local

# Iniciar servidor
npm run dev:sandbox
```

### Produção (Cloudflare Pages)
```bash
# Build e deploy
npm run deploy:prod

# Aplicar migrações em produção
npm run db:migrate:prod
```

## 📝 Licença

MIT License - Desenvolvido por Marcos Vinícius

---

**LifeLog IA** - Porque cada dia merece ser registrado e compreendido. 📖✨
