# Configuração de Confirmação de Email no Supabase

## Problema

Por padrão, o Supabase exige confirmação de email antes que um usuário possa fazer login. Isso significa que:

1. Quando um usuário se registra, ele recebe um email de confirmação
2. O usuário precisa clicar no link do email para confirmar a conta
3. Só então ele pode fazer login

## Soluções

### Opção 1: Desabilitar Confirmação de Email (Desenvolvimento)

Para desenvolvimento/teste, você pode desabilitar a confirmação de email:

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Authentication** → **Providers** → **Email**
4. Desabilite **"Confirm email"** (ou "Enable email confirmations")
5. Salve as alterações

**Atenção**: Isso é recomendado apenas para desenvolvimento. Em produção, mantenha a confirmação de email habilitada por segurança.

### Opção 2: Confirmar Email Automaticamente (Desenvolvimento)

Se você quiser manter a confirmação de email habilitada mas confirmar automaticamente durante desenvolvimento:

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Quando um novo usuário for criado, clique no usuário
3. Clique em **"Confirm email"** manualmente

### Opção 3: Configurar Email de Desenvolvimento (Recomendado)

Para receber emails de confirmação durante desenvolvimento:

1. Use um email real ao se registrar
2. Verifique sua caixa de entrada (e spam)
3. Clique no link de confirmação
4. Faça login normalmente

## Como Funciona no App

O app agora trata corretamente os casos de confirmação de email:

### Registro
- Se o email precisar ser confirmado, mostra uma mensagem informativa
- Redireciona para a tela de login
- O usuário deve confirmar o email antes de fazer login

### Login
- Se o email não foi confirmado, mostra mensagem clara
- Orienta o usuário a verificar o email

## Mensagens de Erro

O app identifica automaticamente erros relacionados a confirmação de email e mostra mensagens apropriadas:

- **"Usuário criado com sucesso! Verifique seu email para confirmar a conta antes de fazer login."**
- **"Email não confirmado. Verifique sua caixa de entrada e confirme sua conta antes de fazer login."**

## Avisos sobre Expo Go

Os avisos sobre `expo-notifications` no Expo Go são esperados e não afetam o funcionamento do app. Eles aparecem porque:

- Expo Go não suporta notificações push completamente
- Para notificações push completas, você precisa criar um development build

Esses avisos podem ser ignorados durante desenvolvimento. As notificações funcionarão corretamente em um development build ou build de produção.

