# 🚀 Guia Completo de Migração: Neon → Supabase

Migração completa do banco de dados e autenticação do Neon para Supabase.

## 📋 Visão Geral

**O que será migrado:**
- ✅ Banco de dados (Neon Postgres → Supabase Postgres)
- ✅ Autenticação (Neon Auth → Supabase Auth)
- ✅ Backend API (endpoints atualizados)
- ✅ Mobile App (SDK nativo Supabase)

**Tempo estimado:** 2-4 horas

## 🎯 Passo 1: Criar Projeto Supabase

### 1.1 Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **Start your project**
3. Faça login com GitHub/Google
4. Clique em **New Project**
5. Preencha:
   - **Name**: `takepips`
   - **Database Password**: (anote esta senha!)
   - **Region**: Escolha mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan**: Free (para começar)

6. Aguarde ~2 minutos para o projeto ser criado

### 1.2 Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:

```
Project URL: https://xxxxx.supabase.co
Project API Key (anon/public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key (secret): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Vá em **Settings** → **Database** → **Connection String**
4. Copie a **Connection String** (URI mode)

---

## 🗄️ Passo 2: Migrar Schema do Banco

### 2.1 Acessar SQL Editor

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**

### 2.2 Executar Schema Completo

Copie e execute o conteúdo completo do arquivo `supabase/migration_complete.sql`:

```sql
-- Schema completo para TakePips no Supabase
-- Execute este arquivo no SQL Editor do Supabase

-- Tabela de sinais
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  symbol VARCHAR(20) NOT NULL,
  entry DECIMAL(20, 5) NOT NULL,
  stop_loss DECIMAL(20, 5) NOT NULL,
  take1 DECIMAL(20, 5) NOT NULL,
  take2 DECIMAL(20, 5) NOT NULL,
  take3 DECIMAL(20, 5) NOT NULL,
  stop_ticks INTEGER NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EM_OPERACAO', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3', 'ENCERRADO')),
  stop_hit_at TIMESTAMP WITH TIME ZONE,
  take1_hit_at TIMESTAMP WITH TIME ZONE,
  take2_hit_at TIMESTAMP WITH TIME ZONE,
  take3_hit_at TIMESTAMP WITH TIME ZONE,
  stop_hit_price DECIMAL(20, 5),
  take1_hit_price DECIMAL(20, 5),
  take2_hit_price DECIMAL(20, 5),
  take3_hit_price DECIMAL(20, 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de push subscriptions (Web Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabela de tokens Expo Push (React Native)
CREATE TABLE IF NOT EXISTS expo_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  platform TEXT,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para signals
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
CREATE INDEX IF NOT EXISTS idx_signals_time ON signals(time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_symbol_time ON signals(symbol, time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_pending ON signals(status) WHERE status = 'PENDING';

-- Índices para push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_expo_push_tokens_token ON expo_push_tokens(token);

-- Enable Row Level Security (RLS) para Supabase Auth
-- As tabelas serão acessíveis apenas via API com service role key
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expo_push_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso via service role (backend)
-- Em produção, você pode criar políticas mais específicas
CREATE POLICY "Allow all for service role" ON signals
  FOR ALL USING (true);
  
CREATE POLICY "Allow all for service role" ON push_subscriptions
  FOR ALL USING (true);
  
CREATE POLICY "Allow all for service role" ON expo_push_tokens
  FOR ALL USING (true);
```

### 2.3 Migrar Dados Existentes (Opcional)

Se você já tem dados no Neon que quer migrar:

1. Exportar dados do Neon:
   ```bash
   pg_dump $NEON_DATABASE_URL > neon_backup.sql
   ```

2. Importar no Supabase:
   - No SQL Editor do Supabase
   - Execute comandos `INSERT` para cada tabela
   - Ou use o comando:
   ```bash
   psql $SUPABASE_DATABASE_URL < neon_backup.sql
   ```

---

## ⚙️ Passo 3: Configurar Backend (Vercel)

### 3.1 Instalar Supabase SDK

```bash
cd C:\Projetos\takepips
npm install @supabase/supabase-js
```

### 3.2 Configurar Variáveis de Ambiente na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **takepips**
3. Vá em **Settings** → **Environment Variables**
4. **Remova** as variáveis do Neon Auth:
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`

5. **Adicione** as variáveis do Supabase:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | **All** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | **All** |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | **All** |
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres` | **All** |

6. Marque todas as opções (Production, Preview, Development)
7. Clique em **Save**

### 3.3 Atualizar Conexão do Banco

O arquivo `src/infrastructure/database/connection.ts` será atualizado para usar Supabase.

### 3.4 Criar Novos Endpoints de Auth

Os endpoints `api/auth/register.ts` e `api/auth/login.ts` serão atualizados para usar Supabase Auth.

---

## 📱 Passo 4: Configurar Mobile App

### 4.1 Instalar Supabase SDK

```bash
cd mobile
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
```

### 4.2 Configurar Variáveis de Ambiente

No `mobile/app.config.js`, adicione:

```javascript
extra: {
  apiUrl: process.env.API_URL || 'https://seu-backend.vercel.app',
  supabaseUrl: process.env.SUPABASE_URL || 'https://xxxxx.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
}
```

Para desenvolvimento local, crie `mobile/.env.local`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API_URL=https://seu-backend.vercel.app
```

### 4.3 Atualizar Auth Repository

O `mobile/src/infrastructure/repositories/AuthRepository.ts` será atualizado para usar Supabase SDK nativo.

---

## ✅ Passo 5: Testar Migração

### 5.1 Testar Backend

```bash
# Registrar usuário
curl -X POST https://seu-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Teste",
    "email": "teste@example.com",
    "password": "senha123"
  }'

# Login
curl -X POST https://seu-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 5.2 Verificar Usuários no Supabase

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Você verá o usuário criado automaticamente!

### 5.3 Testar Mobile App

1. Execute o app mobile
2. Tente registrar um novo usuário
3. Faça login
4. Verifique se está funcionando

---

## 🔄 Passo 6: Deploy e Atualização

### 6.1 Commit das Mudanças

```bash
git add .
git commit -m "Migrar para Supabase Auth e Database"
git push
```

A Vercel fará deploy automaticamente.

### 6.2 Verificar Deploy

1. Acesse Vercel Dashboard
2. Verifique se o deploy foi bem-sucedido
3. Teste os endpoints em produção

---

## 🎉 Benefícios da Migração

✅ **SDK Nativo React Native**: Sem necessidade de API híbrida  
✅ **Sincronização Automática**: Usuários aparecem no banco automaticamente  
✅ **Recursos Completos**: OAuth, Magic Links, 2FA, SMS  
✅ **Melhor Documentação**: Grande comunidade e exemplos  
✅ **Free Tier Generoso**: 500MB database, 50k MAU grátis  
✅ **Open Source**: Transparente e confiável  

---

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Verifique se as variáveis estão corretas na Vercel
- Certifique-se de usar `anon key` no frontend e `service role key` no backend

### Usuários não aparecem
- Verifique se Supabase Auth está habilitado
- Confirme que o endpoint está usando Supabase SDK corretamente

### Erro de conexão
- Verifique a `DATABASE_URL` do Supabase
- Certifique-se de que o projeto está ativo

---

## 📚 Próximos Passos

Após a migração:

1. ✅ Configurar OAuth (Google, GitHub)
2. ✅ Adicionar Magic Links
3. ✅ Configurar 2FA (se necessário)
4. ✅ Otimizar queries com Supabase Realtime
5. ✅ Configurar backups automáticos

---

## 📖 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [React Native Guide](https://supabase.com/docs/guides/auth/react-native)
- [Database Guide](https://supabase.com/docs/guides/database)
