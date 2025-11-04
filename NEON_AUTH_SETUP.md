# 🔐 Configuração Neon Auth - TakePips

Guia completo para configurar **Neon Authentication** no projeto TakePips.

## 📚 Documentação Oficial

- [Neon Auth para Next.js](https://neon.com/docs/neon-auth/quick-start/nextjs)
- [Neon Auth Overview](https://neon.com/docs/neon-auth)

## 🎯 Arquitetura

Para React Native, vamos usar uma **arquitetura híbrida**:

```
Mobile App (React Native)
    ↓
Backend API (Vercel Serverless)
    ↓
Neon Auth SDK (Backend)
    ↓
Neon Database (Postgres)
```

**Por que híbrida?**
- O SDK `@stackframe/react` é otimizado para React Web/Next.js
- React Native precisa de adaptações específicas
- Backend usa Neon Auth nativamente
- Mobile consome API REST do backend

## 🔧 Passo 1: Configurar Neon Auth no Console

1. **Acesse o Console do Neon:**
   - Vá para [console.neon.tech](https://console.neon.tech)
   - Selecione seu projeto ou crie um novo

2. **Habilite Neon Auth:**
   - No projeto, vá em **Auth**
   - Clique em **Enable Neon Auth**
   - Siga as instruções na tela

3. **Obtenha as Chaves:**
   - Na aba **Configuration**
   - Selecione **Next.js** (mesmo que não use Next.js)
   - Copie as variáveis de ambiente:
     ```
     NEXT_PUBLIC_STACK_PROJECT_ID=seu-project-id
     NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua-publishable-key
     STACK_SECRET_SERVER_KEY=sua-secret-key
     DATABASE_URL=sua-connection-string
     ```

## 🔧 Passo 2: Configurar Backend

### 2.1 Instalar SDK no Backend

```bash
npm install @stackframe/nextjs
```

### 2.2 Configurar Variáveis de Ambiente

Na **Vercel** (Settings → Environment Variables):

```env
NEXT_PUBLIC_STACK_PROJECT_ID=seu-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=sua-publishable-key
STACK_SECRET_SERVER_KEY=sua-secret-key
DATABASE_URL=sua-connection-string-neon
```

### 2.3 Atualizar Endpoints de Auth

Os endpoints `/api/auth/register` e `/api/auth/login` serão atualizados para usar Neon Auth.

## 🔧 Passo 3: Configurar Mobile App

O mobile app **não precisa** das chaves do Neon Auth diretamente, pois consome a API do backend.

Apenas configure a URL da API:

**No `mobile/app.config.js`:**

```javascript
extra: {
  apiUrl: 'https://seu-backend.vercel.app',
}
```

## 📊 Como Funciona

### Fluxo de Registro

1. **Mobile** → `POST /api/auth/register` (fullName, email, password)
2. **Backend** → Usa Neon Auth SDK para criar usuário
3. **Neon Auth** → Cria usuário e sincroniza com `neon_auth.users_sync`
4. **Backend** → Retorna token JWT para mobile
5. **Mobile** → Salva token e redireciona

### Fluxo de Login

1. **Mobile** → `POST /api/auth/login` (email, password)
2. **Backend** → Usa Neon Auth SDK para autenticar
3. **Neon Auth** → Valida credenciais
4. **Backend** → Retorna token JWT para mobile
5. **Mobile** → Salva token e acessa app

## 🗄️ Tabela de Usuários

Neon Auth cria automaticamente a tabela `neon_auth.users_sync` no seu banco:

```sql
SELECT * FROM neon_auth.users_sync;
```

**Campos disponíveis:**
- `id` - UUID do usuário
- `name` - Nome do usuário
- `email` - Email
- `created_at` - Data de criação
- `updated_at` - Data de atualização
- `raw_json` - JSON completo do usuário

## 🔐 Benefícios do Neon Auth

1. **Sincronização Automática**: Usuários aparecem automaticamente no banco
2. **Segurança**: Senhas hashadas e gerenciadas pelo Neon
3. **OAuth**: Suporte para Google, GitHub, etc.
4. **Múltiplos Métodos**: Email/password, OAuth, Magic Links
5. **Gerenciamento**: Console do Neon para gerenciar usuários

## 📝 Próximos Passos

Após configurar:

1. ✅ Atualizar endpoints do backend para usar Neon Auth SDK
2. ✅ Testar registro e login
3. ✅ Verificar usuários no banco (`neon_auth.users_sync`)
4. ✅ Configurar OAuth (opcional)
5. ✅ Personalizar emails (opcional)

## 🆘 Troubleshooting

### Erro: "Project ID not found"
- Verifique se `NEXT_PUBLIC_STACK_PROJECT_ID` está configurado
- Certifique-se de que o projeto foi criado no Neon Console

### Usuários não aparecem no banco
- Verifique se Neon Auth está habilitado
- Execute: `SELECT * FROM neon_auth.users_sync;`
- Aguarde alguns segundos (sincronização é assíncrona)

### Erro de autenticação
- Verifique as chaves de ambiente
- Confirme que `STACK_SECRET_SERVER_KEY` está correto
- Verifique logs do backend

## 📚 Recursos

- [Neon Auth Docs](https://neon.com/docs/neon-auth)
- [Neon Auth API Reference](https://neon.com/docs/neon-auth/sdks-api)
- [Neon Auth GitHub](https://github.com/neondatabase-labs/neon-auth-nextjs-template)
