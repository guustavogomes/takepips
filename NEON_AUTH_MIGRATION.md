# 🔄 Migração para Neon Auth - Guia Completo

Este guia explica como migrar da autenticação manual para **Neon Auth oficial**.

## 📋 Pré-requisitos

1. Projeto Neon criado
2. Neon Auth habilitado no console
3. Chaves de ambiente obtidas

## 🔧 Passo 1: Configurar Variáveis de Ambiente

Na **Vercel** (Settings → Environment Variables), adicione:

```env
# Neon Auth (obtenha no console.neon.tech → Auth → Configuration)
NEXT_PUBLIC_STACK_PROJECT_ID=seu-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua-publishable-key
STACK_SECRET_SERVER_KEY=sua-secret-key

# Database (já deve existir)
DATABASE_URL=sua-connection-string-neon
```

## 🔧 Passo 2: Atualizar Endpoints

### Opção A: Usar Endpoints com Neon Auth (Recomendado)

Substitua os arquivos:

```bash
# Fazer backup dos arquivos atuais
mv api/auth/register.ts api/auth/register-old.ts
mv api/auth/login.ts api/auth/login-old.ts

# Usar os novos endpoints com Neon Auth
# Os arquivos api/auth/register-neon.ts e api/auth/login-neon.ts já estão criados
```

**Renomeie os arquivos:**
- `api/auth/register-neon.ts` → `api/auth/register.ts`
- `api/auth/login-neon.ts` → `api/auth/login.ts`

### Opção B: Manter Implementação Atual

Se preferir manter a implementação atual (hash SHA-256), você pode:
- Continuar usando `api/auth/register.ts` e `api/auth/login.ts` atuais
- Migrar gradualmente para Neon Auth depois

## 🔧 Passo 3: Verificar Instalação

O SDK `@stackframe/js` já foi instalado. Verifique:

```bash
npm list @stackframe/js
```

## 📊 Diferenças

### Implementação Atual (Manual)
- Hash SHA-256 simples
- Tabela `users` customizada
- Tokens base64 simples
- Gerenciamento manual

### Neon Auth (Oficial)
- Hash seguro gerenciado pelo Neon
- Tabela `neon_auth.users_sync` automática
- Tokens JWT profissionais
- Console de gerenciamento
- Suporte OAuth
- Magic Links

## ✅ Benefícios da Migração

1. **Segurança**: Senhas hashadas com bcrypt/argon2
2. **Sincronização**: Usuários aparecem automaticamente no banco
3. **OAuth**: Login com Google, GitHub, etc.
4. **Console**: Gerenciar usuários pelo Neon Console
5. **Escalabilidade**: Infraestrutura gerenciada pelo Neon

## 🧪 Testar

1. **Registrar usuário:**
   ```bash
   curl -X POST https://seu-backend.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "João Silva",
       "email": "joao@example.com",
       "password": "senha123"
     }'
   ```

2. **Verificar no banco:**
   ```sql
   SELECT * FROM neon_auth.users_sync;
   ```

3. **Fazer login:**
   ```bash
   curl -X POST https://seu-backend.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "joao@example.com",
       "password": "senha123"
     }'
   ```

## 📝 Notas Importantes

- O mobile app **não precisa mudar** - continua usando a mesma API
- Usuários antigos precisarão se registrar novamente (ou migrar dados)
- Neon Auth cria automaticamente a tabela `neon_auth.users_sync`
- Tokens são diferentes, mas o formato de resposta é compatível

## 🆘 Troubleshooting

### Erro: "Cannot find module '@stackframe/js'"
```bash
npm install @stackframe/js
```

### Erro: "Neon Auth not configured"
- Verifique se as variáveis de ambiente estão configuradas
- Certifique-se de que `STACK_SECRET_SERVER_KEY` está correto

### Usuários não aparecem no banco
- Aguarde alguns segundos (sincronização é assíncrona)
- Execute: `SELECT * FROM neon_auth.users_sync;`
- Verifique se Neon Auth está habilitado no console
