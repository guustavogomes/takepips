# 🔑 Como Obter FCM API Key do Firebase

## 🎯 Você Está Aqui

O EAS está pedindo a **FCM API Key**. Siga estes passos para obtê-la:

---

## 🚀 Passo a Passo

### 1. Criar/Acessar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Se já tiver um projeto, selecione-o
3. Se não tiver, clique em **"Adicionar projeto"**:
   - Nome: **TakePips** (ou qualquer nome)
   - Desabilite Google Analytics (opcional)
   - Clique em **Criar projeto**

### 2. Adicionar App Android ao Firebase

1. No console do Firebase, clique no ícone **Android** (ou **Adicionar app** > **Android**)
2. **Nome do pacote Android**: `com.takepips.mobile`
3. **Apelido do app**: TakePips Mobile
4. **SHA-1** (opcional, mas recomendado): Use o SHA-1 do seu keystore que aparece no EAS:
   ```
   C4:4F:42:36:21:80:CC:FF:6D:FB:D3:A2:FD:B5:B4:95:46:E8:71:07
   ```
5. Clique em **Registrar app**

### 3. Obter FCM API Key (Legacy)

1. No console do Firebase, vá em **Configurações do projeto** (ícone de engrenagem)
2. Vá na aba **Cloud Messaging**
3. Procure por **"Chave do servidor"** ou **"Server key"** (FCM Legacy)
4. **Copie a chave** (é uma string longa)

**OU**

1. Vá em **Configurações do projeto** > **Cloud Messaging**
2. Se não aparecer, vá em **Cloud Messaging API (Legacy)**
3. Ative a API se necessário
4. Copie a **Chave do servidor**

### 4. Voltar ao EAS e Colar a Key

1. Volte ao terminal onde está rodando `eas credentials`
2. Cole a FCM API Key quando solicitado
3. Pressione Enter

---

## ⚠️ Alternativa: Usar FCM V1 (Mais Moderno)

Se preferir usar FCM V1 (recomendado), você pode:

1. **Cancelar** o processo atual (Ctrl+C)
2. Executar novamente:
   ```powershell
   eas credentials
   ```
3. Escolher: **Push Notifications (FCM V1): Google Service Account Key For FCM V1**
4. Escolher: **Set up new credentials**
5. O EAS vai configurar automaticamente!

---

## 📋 Resumo Rápido

1. ✅ Acesse: https://console.firebase.google.com/
2. ✅ Crie/selecione projeto
3. ✅ Adicione app Android (`com.takepips.mobile`)
4. ✅ Vá em **Configurações** > **Cloud Messaging**
5. ✅ Copie a **Chave do servidor** (Server key)
6. ✅ Cole no terminal do EAS

---

## 💡 Dica

Se você não tiver um projeto Firebase ainda, o EAS pode criar automaticamente se você usar **FCM V1** em vez de Legacy. É mais fácil!

Boa sorte! 🚀

