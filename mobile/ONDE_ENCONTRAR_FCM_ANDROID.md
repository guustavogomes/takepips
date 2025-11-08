# 🔍 Onde Encontrar Credenciais FCM para Android

## ⚠️ Atenção: Não Use Certificados Web Push!

A tela que você está vendo mostra **"Certificados push da Web"** - isso é para navegadores web, **NÃO para Android**.

Para Android, você precisa de credenciais diferentes!

---

## 🎯 Onde Encontrar Credenciais para Android

### Opção 1: FCM Legacy - Server Key (Mais Simples)

1. **No Firebase Console**, vá em:
   - **Configurações do projeto** (ícone de engrenagem ⚙️ no canto superior esquerdo)
   - Ou clique no nome do projeto no topo

2. **Vá na aba "Cloud Messaging"**

3. **Procure por:**
   - **"Chave do servidor"** (Server key)
   - Ou **"Cloud Messaging API (Legacy)"**

4. **Copie a chave** (é uma string longa, tipo: `AAAA...`)

5. **Use essa chave** quando o EAS pedir a FCM API Key

---

### Opção 2: FCM V1 - Google Service Account (Recomendado)

**Esta é a opção mais fácil!** O EAS pode fazer tudo automaticamente:

1. **No terminal**, execute:
   ```powershell
   eas credentials
   ```

2. **Escolha:**
   - **Android**
   - **Push Notifications (FCM V1): Google Service Account Key For FCM V1**
   - **Set up new credentials**

3. **O EAS vai:**
   - Criar um projeto Firebase automaticamente (se necessário)
   - Configurar as credenciais
   - Fazer upload para o EAS

**Você não precisa fazer nada manualmente!** 🎉

---

## 📍 Navegação no Firebase Console

### Para Encontrar Server Key (FCM Legacy):

```
Firebase Console
  └─> [Seu Projeto]
      └─> ⚙️ Configurações do projeto (ícone de engrenagem)
          └─> Aba "Cloud Messaging"
              └─> "Chave do servidor" (Server key)
```

### Se Não Aparecer:

1. Vá em **APIs e serviços** > **Biblioteca**
2. Procure por **"Cloud Messaging API (Legacy)"**
3. Ative a API se necessário
4. Volte para **Configurações** > **Cloud Messaging**
5. A chave deve aparecer

---

## 🔄 Passo a Passo Visual

### 1. No Firebase Console:

```
┌─────────────────────────────────────┐
│  Firebase Console                   │
│                                     │
│  [Seu Projeto]  ⚙️ Configurações   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Configurações do projeto      │ │
│  │                                │ │
│  │ [Geral] [Cloud Messaging] ←───┼─┼─ Clique aqui!
│  │                                │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Na Aba Cloud Messaging:

```
┌─────────────────────────────────────┐
│  Cloud Messaging                    │
│                                     │
│  Chave do servidor (Server key):   │
│  ┌───────────────────────────────┐ │
│  │ AAAA... (string longa)        │ │ ← Copie esta!
│  └───────────────────────────────┘ │
│                                     │
│  [Copiar]                           │
└─────────────────────────────────────┘
```

---

## ✅ Resumo: O Que Você Precisa

### ❌ NÃO Use:
- **Certificados push da Web** (o que você está vendo)
- **Par de chaves VAPID** (para navegadores)

### ✅ Use Para Android:

**Opção A - FCM Legacy:**
- **Server Key** (Chave do servidor)
- Encontre em: Configurações > Cloud Messaging

**Opção B - FCM V1 (Recomendado):**
- **Google Service Account Key**
- Configure via `eas credentials` (automático!)

---

## 🚀 Recomendação

**Use FCM V1** - é mais fácil e o EAS faz tudo automaticamente:

```powershell
cd C:\Projetos\takepips\mobile
eas credentials
# Escolha: Android > Push Notifications (FCM V1) > Set up new credentials
```

O EAS vai criar/configurar tudo automaticamente! 🎉

---

## 📋 Checklist

- [ ] Entendi que certificados Web Push NÃO servem para Android
- [ ] Vou usar FCM V1 (recomendado) ou FCM Legacy
- [ ] Se usar Legacy, vou copiar a Server Key do Firebase
- [ ] Se usar V1, vou deixar o EAS configurar automaticamente

---

Boa sorte! 🚀

