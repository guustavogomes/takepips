# 🚀 Quick Start - Neon Auth no TakePips

Guia rápido para configurar Neon Auth seguindo a [documentação oficial](https://neon.com/docs/neon-auth/quick-start/nextjs).

## 📋 Passo 1: Habilitar Neon Auth no Console

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione seu projeto
3. Vá em **Auth** → **Enable Neon Auth**
4. Siga as instruções na tela

## 🔑 Passo 2: Configurar Variáveis de Ambiente

**✅ Você já tem as variáveis!** Agora configure na Vercel:

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **takepips**
3. Vá em **Settings** → **Environment Variables**
4. Adicione as 4 variáveis (veja valores em `NEON_AUTH_CONFIG.md`):

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_STACK_PROJECT_ID` | `c964b025-3727-4f64-b70d-1c32e5bced1a` | **All** |
   | `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | `pck_8t88jz4et21pt13r8e6w4be51zkhde2jkrfyxg1fsmp8g` | **All** |
   | `STACK_SECRET_SERVER_KEY` | `ssk_swety8wtc6ew8t1swhcxe2ga19jdknkn12p3wcwx7xvzr` | **All** |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_4fIzGtjYXKP8@ep-calm-flower-acmb5hjw-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require` | **All** |

5. **IMPORTANTE**: Marque todas as opções (Production, Preview, Development)
6. Clique em **Save**
7. Faça um novo deploy: **Deployments** → **Redeploy**

📖 **Para instruções detalhadas, veja:** [`NEON_AUTH_CONFIG.md`](./NEON_AUTH_CONFIG.md)

## 📱 Passo 4: Configurar Mobile App

O mobile app **não precisa** das chaves do Neon Auth diretamente.

Apenas configure a URL do backend:

**`mobile/app.config.js`:**
```javascript
extra: {
  apiUrl: 'https://seu-backend.vercel.app',
}
```

## 🔄 Passo 5: Migrar Endpoints (Opcional)

### Opção A: Usar Neon Auth (Recomendado)

Substitua os arquivos atuais pelos novos:

```bash
# Backup
mv api/auth/register.ts api/auth/register-old.ts
mv api/auth/login.ts api/auth/login-old.ts

# Renomear novos
mv api/auth/register-neon.ts api/auth/register.ts
mv api/auth/login-neon.ts api/auth/login.ts
```

### Opção B: Manter Implementação Atual

Se preferir, continue usando a implementação atual (hash SHA-256) e migre depois.

## ✅ Passo 6: Testar

1. **Registrar usuário:**
   - Use o app mobile
   - Preencha nome, email e senha
   - Registre-se

2. **Verificar no banco:**
   ```sql
   SELECT * FROM neon_auth.users_sync;
   ```
   
   O usuário deve aparecer automaticamente!

3. **Fazer login:**
   - Use o app mobile
   - Faça login com email e senha

## 📊 Estrutura de Dados

Neon Auth cria automaticamente a tabela `neon_auth.users_sync`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID do usuário |
| `name` | TEXT | Nome completo |
| `email` | TEXT | Email |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |
| `raw_json` | JSONB | Dados completos do usuário |

## 🎯 Benefícios

✅ **Sincronização Automática**: Usuários aparecem no banco automaticamente  
✅ **Segurança**: Senhas hashadas com bcrypt/argon2  
✅ **OAuth**: Login com Google, GitHub, etc.  
✅ **Console**: Gerenciar usuários pelo Neon Console  
✅ **Escalável**: Infraestrutura gerenciada  

## 📚 Documentação

- [Neon Auth Docs](https://neon.com/docs/neon-auth)
- [Quick Start Next.js](https://neon.com/docs/neon-auth/quick-start/nextjs)
- [API Reference](https://neon.com/docs/neon-auth/sdks-api)

## 🆘 Problemas Comuns

### "Neon Auth not configured"
- Verifique se as variáveis estão na Vercel
- Certifique-se de que `STACK_SECRET_SERVER_KEY` está correto

### Usuários não aparecem no banco
- Aguarde alguns segundos (sincronização é assíncrona)
- Execute: `SELECT * FROM neon_auth.users_sync;`
- Verifique se Neon Auth está habilitado

### Erro ao criar usuário
- Verifique logs do backend
- Confirme que o email é único
- Verifique formato da senha (mínimo 6 caracteres)
