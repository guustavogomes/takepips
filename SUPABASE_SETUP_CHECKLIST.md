# ✅ Checklist de Migração para Supabase

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Passo 1: Criar Projeto Supabase

- [ ] Criar conta no [supabase.com](https://supabase.com)
- [ ] Criar novo projeto "takepips"
- [ ] Anotar senha do banco de dados
- [ ] Aguardar projeto ser criado (~2 minutos)

## 📋 Passo 2: Obter Credenciais

- [ ] Copiar **Project URL** (Settings → API)
- [ ] Copiar **anon/public key** (Settings → API)
- [ ] Copiar **service_role key** (Settings → API) ⚠️ SECRETO!
- [ ] Copiar **Connection String** (Settings → Database → Connection String)

## 📋 Passo 3: Executar Schema no Supabase

- [ ] Acessar SQL Editor no Supabase Dashboard
- [ ] Abrir arquivo `supabase/migration_complete.sql`
- [ ] Copiar todo o conteúdo
- [ ] Colar no SQL Editor
- [ ] Clicar em **Run**
- [ ] Verificar se não há erros
- [ ] Verificar tabelas criadas: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

## 📋 Passo 4: Configurar Vercel (Backend)

- [ ] Acessar [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Selecionar projeto **takepips**
- [ ] Ir em **Settings** → **Environment Variables**

### Remover variáveis antigas (Neon Auth):
- [ ] Remover `NEXT_PUBLIC_STACK_PROJECT_ID`
- [ ] Remover `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- [ ] Remover `STACK_SECRET_SERVER_KEY`

### Adicionar variáveis novas (Supabase):
- [ ] Adicionar `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] Adicionar `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] Adicionar `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ SECRETO!
- [ ] Atualizar `DATABASE_URL` = `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### Configurar ambientes:
- [ ] Marcar todas as variáveis para **Production**
- [ ] Marcar todas as variáveis para **Preview**
- [ ] Marcar todas as variáveis para **Development**
- [ ] Clicar em **Save**

## 📋 Passo 5: Atualizar Backend (Local)

- [ ] Instalar Supabase SDK: `npm install @supabase/supabase-js`
- [ ] Renomear endpoints:
  - [ ] `api/auth/register-supabase.ts` → `api/auth/register.ts` (backup do antigo primeiro!)
  - [ ] `api/auth/login-supabase.ts` → `api/auth/login.ts` (backup do antigo primeiro!)
- [ ] Atualizar `src/infrastructure/database/connection.ts` para usar Supabase (ou criar novo)
- [ ] Testar endpoints localmente (se possível)

## 📋 Passo 6: Configurar Mobile App

- [ ] Instalar Supabase SDK: `cd mobile && npm install @supabase/supabase-js`
- [ ] Atualizar `mobile/app.config.js`:
  - [ ] Adicionar `supabaseUrl` em `extra`
  - [ ] Adicionar `supabaseAnonKey` em `extra`
- [ ] Atualizar `mobile/src/shared/config/dependencies.ts`:
  - [ ] Trocar `AuthRepository` por `AuthRepositorySupabase`
- [ ] Remover `@stackframe/react` (opcional, se não usar mais)

## 📋 Passo 7: Migrar Dados (Opcional)

Se você tem dados existentes no Neon:

- [ ] Exportar dados do Neon
- [ ] Importar no Supabase
- [ ] Verificar se dados estão corretos

## 📋 Passo 8: Deploy e Teste

- [ ] Fazer commit das mudanças
- [ ] Push para Git
- [ ] Aguardar deploy na Vercel
- [ ] Verificar se deploy foi bem-sucedido

### Testar Backend:
- [ ] Testar registro: `curl -X POST https://seu-backend.vercel.app/api/auth/register ...`
- [ ] Testar login: `curl -X POST https://seu-backend.vercel.app/api/auth/login ...`
- [ ] Verificar logs da Vercel

### Testar Mobile:
- [ ] Executar app: `cd mobile && npx expo start`
- [ ] Tentar registrar novo usuário
- [ ] Verificar se usuário aparece no Supabase Dashboard → Authentication → Users
- [ ] Tentar fazer login
- [ ] Verificar se sessão persiste

### Verificar Banco:
- [ ] Acessar Supabase Dashboard → Table Editor
- [ ] Verificar se tabela `signals` existe
- [ ] Verificar se tabela `push_subscriptions` existe
- [ ] Verificar se tabela `expo_push_tokens` existe
- [ ] Verificar se usuários aparecem em Authentication → Users

## 📋 Passo 9: Limpeza (Opcional)

- [ ] Remover arquivos antigos (Neon Auth):
  - [ ] `api/auth/register-neon.ts`
  - [ ] `api/auth/login-neon.ts`
  - [ ] `mobile/src/infrastructure/repositories/AuthRepository.ts` (se não usar mais)
- [ ] Atualizar documentação
- [ ] Remover `@stackframe/react` e `@stackframe/js` do package.json

## 🎉 Concluído!

Se todos os itens estão marcados, a migração está completa!

---

## 🆘 Problemas Comuns

### Erro: "Invalid API key"
- [ ] Verificar se `SUPABASE_SERVICE_ROLE_KEY` está correto
- [ ] Verificar se não há espaços extras
- [ ] Verificar se está usando service role key no backend e anon key no frontend

### Usuários não aparecem
- [ ] Verificar se Supabase Auth está habilitado
- [ ] Verificar logs do backend
- [ ] Verificar se email está sendo confirmado

### Erro de conexão
- [ ] Verificar `DATABASE_URL` do Supabase
- [ ] Verificar se projeto está ativo
- [ ] Verificar se senha está correta

## 📚 Recursos

- [Guia Completo](./SUPABASE_MIGRATION_GUIDE.md)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
