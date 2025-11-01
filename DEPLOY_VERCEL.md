# 🚀 Deploy na Vercel - Guia Rápido

Como endpoints externos funcionam no MT5, fazer deploy na Vercel é a melhor solução.

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (grátis)
2. Projeto criado no Neon com schema executado
3. Connection string do Neon

## 🔧 Passo a Passo

### 1. Preparar Repositório

Se ainda não fez:
```powershell
git init
git add .
git commit -m "Initial commit"
```

Crie um repositório no GitHub e faça push:
```powershell
git remote add origin https://github.com/seu-usuario/takepips.git
git push -u origin main
```

### 2. Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Importe seu repositório

### 3. Configurar Variáveis de Ambiente

Na Vercel:
1. Settings → Environment Variables
2. Adicione:
   - **Name:** `DATABASE_URL`
   - **Value:** Sua connection string do Neon
   - **Environment:** Production, Preview, Development (marque todos)
3. Clique em **Save**

### 4. Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build (pode levar 1-2 minutos)
3. Quando terminar, você terá uma URL como: `https://takepips-xyz.vercel.app`

### 5. Configurar MT5

1. **URLs permitidas:**
   - Tools → Options → Expert Advisors
   - Adicione: `https://takepips-xyz.vercel.app/*`
   - (Use a URL que a Vercel gerou)

2. **URL no indicador:**
   - Propriedades do indicador
   - `EndpointURL`: `https://takepips-xyz.vercel.app/api/signals`

3. **Reinicie o MT5**

## ✅ Vantagens do Deploy

- ✅ URL fixa (não muda)
- ✅ Funciona perfeitamente com MT5
- ✅ Sempre disponível
- ✅ Grátis (plano free é suficiente)
- ✅ Deploy automático a cada push no GitHub

## 🔍 Verificar Deploy

Após o deploy, teste:
```powershell
Invoke-RestMethod -Uri "https://seu-projeto.vercel.app/health" -Method GET
```

Ou abra no navegador: `https://seu-projeto.vercel.app/api/signals`

## 📝 Próximos Passos

1. Faça deploy na Vercel
2. Configure as URLs no MT5
3. Teste o envio de sinais
4. Pronto! 🎉

