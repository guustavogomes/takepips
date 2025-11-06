# 🔧 Atualizar DATABASE_URL para Supabase

## ⚠️ Problema
A `DATABASE_URL` ainda está apontando para o Neon, mas precisamos usar a connection string do Supabase.

## ✅ Solução: Atualizar DATABASE_URL na Vercel

### Passo 1: Obter Connection String do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto **takepips**
3. Vá em **Settings** → **Database**
4. Role até a seção **Connection String**
5. Selecione a aba **URI**
6. Copie a connection string (formato):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   
   **OU** (se preferir conexão direta):
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

**⚠️ IMPORTANTE:**
- Substitua `[PASSWORD]` pela senha do banco de dados do Supabase
- Se não souber a senha, você pode resetá-la em **Settings** → **Database** → **Database Password**

### Passo 2: Atualizar na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **takepips**
3. Vá em **Settings** → **Environment Variables**
4. Encontre a variável `DATABASE_URL`
5. Clique nos **três pontos** (⋯) → **Edit**
6. **Substitua** o valor antigo (do Neon) pelo novo (do Supabase)
7. Certifique-se de que está marcado para **All Environments** (Production, Preview, Development)
8. Clique em **Save**

### Passo 3: Fazer Redeploy

Após atualizar a variável:

1. Vá em **Deployments**
2. Clique nos **três pontos** (⋯) do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy completar

### Passo 4: Verificar

Após o deploy, teste criando um sinal e verifique os logs:

**Logs esperados:**
```
[PUSH] ✅ DATABASE_URL configurada, usando conexão direta PostgreSQL...
[PUSH] Entrando no bloco try para buscar subscribers...
[PUSH] Buscando Web Push subscriptions...
[PUSH] Executando query SQL direta: SELECT endpoint, p256dh, auth FROM push_subscriptions
[PUSH] ✅ Query de Web Push subscriptions executada com sucesso
[PUSH] Web Push subscriptions encontradas: 0
[PUSH] Buscando tokens Expo na tabela expo_push_tokens...
[PUSH] Executando query SQL direta: SELECT token, platform, device_id, created_at FROM expo_push_tokens
[PUSH] ✅ Query de tokens Expo executada com sucesso
[PUSH] Tokens Expo encontrados: X
```

**Se aparecer erro:**
- Verifique se a senha está correta
- Verifique se o formato da connection string está correto
- Verifique se o projeto Supabase está ativo

## 📝 Formato Correto

A connection string deve estar assim:

**Opção 1 - Pooler (Recomendado para Vercel):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Opção 2 - Conexão Direta:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Exemplo real:**
```
postgresql://postgres.abcdefghijklmnop:minhasenha123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🔍 Como Verificar se Está Correto

Execute esta query no Supabase SQL Editor para testar:
```sql
SELECT COUNT(*) FROM expo_push_tokens;
```

Se funcionar, a connection string está correta!

