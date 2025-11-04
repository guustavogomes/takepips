# 🔐 Configuração de Autenticação - TakePips Mobile

Guia completo para configurar autenticação de usuários no app.

## 📋 Arquitetura de Autenticação

O sistema de autenticação segue os princípios SOLID:

### Domain Layer
- `User` - Entidade de usuário
- `IAuthRepository` - Interface para operações de autenticação

### Application Layer
- `RegisterUseCase` - Registro de usuários
- `LoginUseCase` - Login de usuários

### Infrastructure Layer
- `AuthRepository` - Implementação usando backend API
- `ApiClient` - Cliente HTTP com interceptors para token

### Presentation Layer
- `useAuth` hooks - Hooks React Query para autenticação
- Telas de login e registro

## 🚀 Fluxo de Autenticação

1. **Splash Screen** → Verifica se usuário está logado
2. **Login/Register** → Autentica usuário
3. **Salva Token** → AsyncStorage
4. **Interceptors** → Adiciona token automaticamente nas requisições
5. **Tabs** → Acesso às telas principais

## 🔧 Backend

### Endpoints Criados

1. **POST /api/auth/register**
   - Registra novo usuário
   - Campos: `fullName`, `email`, `password`
   - Retorna: `user` e `token`

2. **POST /api/auth/login**
   - Faz login
   - Campos: `email`, `password`
   - Retorna: `user` e `token`

### Tabela de Usuários

O backend cria automaticamente a tabela:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## 📱 Funcionalidades Implementadas

### ✅ Tela de Splash
- Animação elegante com "TakePips" em amarelo
- Efeitos de candle de alta (verde) e baixa (vermelho)
- Verificação automática de autenticação
- Redirecionamento inteligente

### ✅ Tela de Login
- Design elegante e responsivo
- Validação de email e senha
- Mostrar/ocultar senha
- Feedback visual de loading
- Navegação para registro

### ✅ Tela de Registro
- Formulário completo:
  - Nome completo
  - Email
  - Senha (mínimo 6 caracteres)
  - Confirmar senha
- Validação em tempo real
- Indicador de senhas não coincidentes
- Navegação para login

### ✅ Gerenciamento de Sessão
- Token salvo automaticamente
- Interceptor adiciona token nas requisições
- Logout remove token e redireciona
- Verificação de autenticação em todas as telas

## 🔒 Segurança

**Nota Importante**: A implementação atual usa hash SHA-256 simples. Para produção, você deve:

1. **Usar Neon Authentication** (recomendado):
   - Integração nativa com Neon
   - Gerenciamento seguro de senhas
   - JWT tokens profissionais

2. **Ou usar bcrypt**:
   ```bash
   npm install bcrypt
   ```

3. **Implementar JWT adequado**:
   ```bash
   npm install jsonwebtoken
   ```

## 📝 Próximos Passos

Para usar **Neon Authentication** completo:

1. Configurar Neon Auth no console do Neon
2. Obter API keys
3. Atualizar `AuthRepository` para usar SDK do Neon Auth
4. Configurar variáveis de ambiente

## 🎨 Design

- **Cores**: Tema escuro (#0A0E27) com acentos azuis (#4A90E2)
- **Tipografia**: Clara e hierárquica
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Animações**: Suaves e profissionais

## ✅ Testes

Para testar:

1. **Registro**:
   - Preencha todos os campos
   - Verifique validação de senha
   - Teste email duplicado

2. **Login**:
   - Use credenciais válidas
   - Teste credenciais inválidas
   - Verifique persistência de sessão

3. **Logout**:
   - Teste botão de logout
   - Verifique redirecionamento
   - Confirme que token é removido
