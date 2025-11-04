# 🔐 Endpoints de Autenticação

## 📁 Arquivos Disponíveis

### Implementação Atual (Manual)
- **`register.ts`** - Registro com hash SHA-256
- **`login.ts`** - Login com hash SHA-256

### Implementação Neon Auth (Oficial)
- **`register-neon.ts`** - Registro usando Neon Auth SDK
- **`login-neon.ts`** - Login usando Neon Auth SDK

## 🔄 Como Migrar

### Opção 1: Usar Neon Auth (Recomendado)

1. **Configure as variáveis de ambiente na Vercel:**
   ```env
   NEXT_PUBLIC_STACK_PROJECT_ID=seu-project-id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua-publishable-key
   STACK_SECRET_SERVER_KEY=sua-secret-key
   ```

2. **Renomeie os arquivos:**
   ```bash
   # Backup dos arquivos atuais
   mv api/auth/register.ts api/auth/register-manual.ts
   mv api/auth/login.ts api/auth/login-manual.ts
   
   # Usar implementação Neon Auth
   mv api/auth/register-neon.ts api/auth/register.ts
   mv api/auth/login-neon.ts api/auth/login.ts
   ```

3. **Faça deploy:**
   ```bash
   vercel --prod
   ```

### Opção 2: Manter Implementação Manual

Continue usando `register.ts` e `login.ts` atuais. Eles funcionam perfeitamente, mas não têm:
- Sincronização automática com `neon_auth.users_sync`
- Suporte OAuth
- Console de gerenciamento
- Magic Links

## 📊 Comparação

| Recurso | Manual | Neon Auth |
|---------|--------|-----------|
| Hash de senha | SHA-256 | bcrypt/argon2 |
| Tabela | `users` customizada | `neon_auth.users_sync` |
| OAuth | ❌ | ✅ |
| Console | ❌ | ✅ |
| Magic Links | ❌ | ✅ |
| Sincronização | Manual | Automática |

## 🧪 Testar

### Registro
```bash
curl -X POST https://seu-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

### Login
```bash
curl -X POST https://seu-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'
```

## 📚 Documentação

- [Neon Auth Setup Guide](../NEON_AUTH_SETUP.md)
- [Neon Auth Quick Start](../NEON_AUTH_QUICK_START.md)
- [Neon Auth Migration](../NEON_AUTH_MIGRATION.md)
