# 🎯 Escolher Opção Correta no EAS Credentials

## ✅ Opção Correta

**Escolha:** `Google Service Account`

**NÃO escolha:** `Push Notifications (Legacy)` (está desativado!)

---

## 📋 Passo a Passo

1. **Use as setas do teclado** para selecionar `Google Service Account`
2. **Pressione Enter**

---

## 🔄 O Que Pode Acontecer Depois

### Cenário 1: Menu de FCM V1

Se aparecer um menu perguntando sobre FCM V1:

- Escolha: `FCM V1: Google Service Account Key For FCM V1`
- Depois: `Set up new credentials`

### Cenário 2: Menu de Google Service Account

Se aparecer um menu sobre Google Service Account:

- Escolha a opção relacionada a **Push Notifications** ou **FCM**
- Ou escolha: `Set up new credentials`

### Cenário 3: Pede Projeto Firebase

Se pedir para escolher ou criar projeto Firebase:

- Se já tiver projeto: escolha o existente
- Se não tiver: escolha `Create new Firebase project`
- O EAS vai criar/configurar tudo automaticamente

---

## ❓ Se Não Aparecer Opção de FCM V1

Se após escolher "Google Service Account" não aparecer opção de FCM V1, você pode:

1. **Cancelar** (Ctrl+C)
2. **Verificar se precisa atualizar EAS CLI:**
   ```powershell
   npm install -g eas-cli@latest
   ```
3. **Tentar novamente:**
   ```powershell
   eas credentials
   ```

---

## 🎯 Resumo

**Agora:**
- ✅ Selecione: `Google Service Account`
- ❌ NÃO selecione: `Push Notifications (Legacy)`

**Depois:**
- Siga as instruções na tela
- Escolha opções relacionadas a FCM V1 ou Push Notifications
- Deixe o EAS configurar automaticamente

---

Boa sorte! 🚀

