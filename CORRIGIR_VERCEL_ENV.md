# 🔧 Corrigir Variável de Ambiente na Vercel

O erro indica que a variável `DATABASE_URL` está configurada para usar um Secret que não existe.

## ✅ Solução: Criar Variável de Ambiente Diretamente

### Opção 1: Variável de Ambiente Normal (Recomendado)

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Se a variável `DATABASE_URL` existir, **DELETE ela**
4. Clique em **"Add New"**
5. Preencha:
   - **Key:** `DATABASE_URL`
   - **Value:** Cole sua connection string do Neon
     ```
     postgresql://user:password@host.neon.tech/database?sslmode=require
     ```
   - **Environments:** Marque todas (Production, Preview, Development)
6. Clique em **Save**
7. **NÃO marque "Use Secret"** - deixe como variável normal

### Opção 2: Usar Secret (Alternativa)

Se preferir usar Secret:

1. Na Vercel, vá em **Settings** → **Secrets**
2. Clique em **"Create Secret"**
3. Preencha:
   - **Name:** `database_url`
   - **Value:** Sua connection string do Neon
4. Clique em **Create**
5. Volte em **Environment Variables**
6. Adicione `DATABASE_URL` e selecione o Secret criado

## ⚠️ Importante

- Use **Opção 1** (mais simples e recomendado)
- Após adicionar/corrigir, **refaça o deploy**
- A connection string do Neon já é segura por si só

## 🔍 Verificar se Funcionou

Após configurar:
1. Vá em **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **"Redeploy"**
4. Aguarde o build
5. Verifique os logs - não deve ter erro de `DATABASE_URL`

## 📝 Formato Correto da DATABASE_URL

A connection string deve estar assim:
```
postgresql://usuario:senha@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require
```

**Importante:**
- Substitua `usuario`, `senha`, `ep-xxx-xxx`, `region`, `dbname` pelos valores reais
- Mantenha `?sslmode=require` no final

