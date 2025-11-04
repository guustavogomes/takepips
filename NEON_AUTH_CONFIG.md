# ⚙️ Configuração Neon Auth - Variáveis de Ambiente

Este guia mostra **exatamente** onde e como configurar as variáveis de ambiente do Neon Auth.

## 🔑 Variáveis Necessárias

Você já tem as variáveis do Neon Auth. Aqui estão elas:

```env
NEXT_PUBLIC_STACK_PROJECT_ID='c964b025-3727-4f64-b70d-1c32e5bced1a'
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY='pck_8t88jz4et21pt13r8e6w4be51zkhde2jkrfyxg1fsmp8g'
STACK_SECRET_SERVER_KEY='ssk_swety8wtc6ew8t1swhcxe2ga19jdknkn12p3wcwx7xvzr'
DATABASE_URL='postgresql://neondb_owner:npg_4fIzGtjYXKP8@ep-calm-flower-acmb5hjw-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
```

## 📍 Onde Configurar

### 1. Vercel (Produção) - IMPORTANTE

**Você PRECISA configurar na Vercel para que o backend funcione:**

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **takepips**
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_STACK_PROJECT_ID` | `c964b025-3727-4f64-b70d-1c32e5bced1a` | **Production, Preview, Development** |
   | `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | `pck_8t88jz4et21pt13r8e6w4be51zkhde2jkrfyxg1fsmp8g` | **Production, Preview, Development** |
   | `STACK_SECRET_SERVER_KEY` | `ssk_swety8wtc6ew8t1swhcxe2ga19jdknkn12p3wcwx7xvzr` | **Production, Preview, Development** |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_4fIzGtjYXKP8@ep-calm-flower-acmb5hjw-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require` | **Production, Preview, Development** |

5. **IMPORTANTE**: Marque todas as opções (Production, Preview, Development)
6. Clique em **Save**
7. Faça um novo deploy: **Deployments** → **Redeploy**

### 2. Ambiente Local (Opcional - para testar localmente)

Se quiser testar localmente, crie um arquivo `.env.local` na raiz do projeto:

```bash
# Na raiz do projeto (não na pasta mobile/)
NEXT_PUBLIC_STACK_PROJECT_ID=c964b025-3727-4f64-b70d-1c32e5bced1a
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_8t88jz4et21pt13r8e6w4be51zkhde2jkrfyxg1fsmp8g
STACK_SECRET_SERVER_KEY=ssk_swety8wtc6ew8t1swhcxe2ga19jdknkn12p3wcwx7xvzr
DATABASE_URL=postgresql://neondb_owner:npg_4fIzGtjYXKP8@ep-calm-flower-acmb5hjw-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE**: 
- Nunca commite o arquivo `.env.local` no Git
- Ele já está no `.gitignore`
- Use apenas para desenvolvimento local

## ✅ Verificar Configuração

### 1. Verificar na Vercel

1. Acesse **Settings** → **Environment Variables**
2. Confirme que as 4 variáveis estão lá
3. Verifique que estão marcadas para Production, Preview e Development

### 2. Testar Endpoints

Após configurar e fazer deploy, teste:

```bash
# Registrar usuário
curl -X POST https://seu-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Teste Usuário",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

Se funcionar, você verá:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

## 🔄 Migrar Endpoints para Neon Auth

Após configurar as variáveis, você pode migrar:

```bash
# Backup dos arquivos atuais
cd api/auth
mv register.ts register-manual.ts
mv login.ts login-manual.ts

# Usar implementação Neon Auth
mv register-neon.ts register.ts
mv login-neon.ts login.ts
```

Depois faça commit e push:
```bash
git add api/auth/register.ts api/auth/login.ts
git commit -m "Migrar para Neon Auth"
git push
```

A Vercel fará deploy automaticamente.

## 🗄️ Verificar Usuários no Banco

Após registrar um usuário, ele aparecerá automaticamente em:

```sql
SELECT * FROM neon_auth.users_sync;
```

A tabela `neon_auth.users_sync` é criada automaticamente pelo Neon Auth.

## 🆘 Troubleshooting

### Erro: "Neon Auth not configured"

- ✅ Verifique se as variáveis estão na Vercel
- ✅ Certifique-se de que fez redeploy após adicionar variáveis
- ✅ Verifique se `STACK_SECRET_SERVER_KEY` está correto (sem espaços extras)

### Variáveis não funcionam

- ✅ Verifique se marcou todas as opções (Production, Preview, Development)
- ✅ Certifique-se de que não há espaços extras ou aspas nas variáveis
- ✅ Faça um novo deploy após adicionar variáveis

### Usuários não aparecem no banco

- ✅ Aguarde alguns segundos (sincronização é assíncrona)
- ✅ Execute: `SELECT * FROM neon_auth.users_sync;`
- ✅ Verifique se Neon Auth está habilitado no console do Neon

## 📝 Próximos Passos

1. ✅ Configure as variáveis na Vercel
2. ✅ Faça redeploy
3. ✅ Migre os endpoints (opcional)
4. ✅ Teste registro e login
5. ✅ Verifique usuários no banco

## 🔒 Segurança

- ⚠️ **NUNCA** commite as variáveis no Git
- ⚠️ **NUNCA** compartilhe `STACK_SECRET_SERVER_KEY` publicamente
- ✅ Use apenas na Vercel (Environment Variables)
- ✅ Use `.env.local` apenas localmente (já está no .gitignore)
