# 🚀 Deploy na Vercel - Passo a Passo Corrigido

## 📋 Passo 1: Preparar Repositório (JÁ FEITO ✅)

Repositório já está no GitHub: `https://github.com/guustavogomes/takepips.git`

## 🔧 Passo 2: Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Importe o repositório `guustavogomes/takepips`
5. Clique em **"Import"**

## ⚙️ Passo 3: Configurar Variáveis de Ambiente (IMPORTANTE)

**ANTES de clicar em Deploy:**

1. Na tela de configuração do projeto, role até **"Environment Variables"**
2. Clique em **"Add New"** ou **"Add"**
3. Preencha:
   ```
   Name: DATABASE_URL
   Value: postgresql://SEU_USUARIO:SUA_SENHA@SEU_HOST.neon.tech/SEU_DATABASE?sslmode=require
   ```
4. **Marque todas as opções:**
   - ☑️ Production
   - ☑️ Preview  
   - ☑️ Development
5. **NÃO marque "Use Secret"** - deixe desmarcado
6. Clique em **"Add"** ou **"Save"**

**⚠️ ATENÇÃO:** Cole a connection string COMPLETA do Neon aqui!

## 🚀 Passo 4: Fazer Deploy

1. Após adicionar a variável, clique em **"Deploy"**
2. Aguarde o build (1-2 minutos)
3. Se der erro, verifique os logs

## ✅ Passo 5: Verificar Deploy

Após o deploy bem-sucedido:

1. Você verá uma URL como: `https://takepips-xyz.vercel.app`
2. Teste acessando: `https://seu-projeto.vercel.app/health`
3. Deve retornar: `{"status":"ok","message":"Server is running"}`

## 🔧 Passo 6: Se Der Erro de DATABASE_URL

Se aparecer erro sobre Secret não existir:

1. Vá em **Settings** → **Environment Variables**
2. Verifique se `DATABASE_URL` existe
3. Se existir e estiver marcado como Secret, **DELETE**
4. Crie novamente como variável normal (sem usar Secret)

## 📝 Passo 7: Configurar MT5

Após deploy bem-sucedido:

1. **URLs permitidas no MT5:**
   - Tools → Options → Expert Advisors
   - Adicione: `https://seu-projeto.vercel.app/*`

2. **URL no indicador:**
   - Propriedades → `EndpointURL`: `https://seu-projeto.vercel.app/api/signals`

3. **Reinicie o MT5**

## 🐛 Problemas Comuns

### Erro: "Secret does not exist"
- **Solução:** Delete a variável e crie novamente SEM usar Secret

### Erro: "DATABASE_URL is missing"
- **Solução:** Verifique se adicionou nas 3 environments (Production, Preview, Development)

### Erro: "Connection refused"
- **Solução:** Verifique se a connection string está correta e se o banco Neon está ativo

