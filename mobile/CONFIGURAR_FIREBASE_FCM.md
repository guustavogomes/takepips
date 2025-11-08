# 🔥 Como Configurar Firebase FCM para Push Notifications Android

## 🎯 Problema Identificado

O erro nos logs mostra:
```
Default FirebaseApp is not initialized in this process com.takepips.mobile. 
Make sure to call FirebaseApp.initializeApp(Context) first.
```

**Solução**: Configurar Firebase Cloud Messaging (FCM) para Android.

---

## 🚀 Solução: Configurar FCM via EAS (Recomendado)

A forma mais fácil é usar o EAS Build para configurar automaticamente as credenciais do Firebase.

### Passo 1: Verificar EAS CLI

```powershell
eas --version
```

Se não tiver instalado:
```powershell
npm install -g eas-cli
```

### Passo 2: Login no EAS

```powershell
eas login
```

### Passo 3: Configurar Credenciais do Firebase

```powershell
cd C:\Projetos\takepips\mobile
eas credentials
```

**Selecione:**
1. **Android**
2. **Push Notifications (FCM)**
3. **Set up new credentials**

O EAS vai:
- Criar um projeto Firebase automaticamente (ou usar um existente)
- Configurar as credenciais FCM
- Fazer upload das credenciais para o EAS

### Passo 4: Gerar Novo Build

Após configurar as credenciais:

```powershell
eas build -p android --profile preview
```

O build agora terá o Firebase configurado e as push notifications funcionarão!

---

## 🔧 Solução Alternativa: Configuração Manual do Firebase

Se preferir configurar manualmente:

### Passo 1: Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome: **TakePips**
4. Desabilite Google Analytics (opcional)
5. Clique em **Criar projeto**

### Passo 2: Adicionar App Android

1. No console do Firebase, clique no ícone **Android**
2. **Nome do pacote Android**: `com.takepips.mobile`
3. **Apelido do app**: TakePips Mobile
4. Clique em **Registrar app**
5. **Baixe o arquivo `google-services.json`**

### Passo 3: Adicionar Arquivo ao Projeto

1. Coloque o arquivo `google-services.json` na raiz de `mobile/`
2. Atualize `app.config.js`:

```javascript
export default {
  expo: {
    // ... outras configurações ...
    android: {
      // ... outras configurações ...
      googleServicesFile: "./google-services.json",
    },
  },
};
```

### Passo 4: Gerar Build

```powershell
eas build -p android --profile preview
```

---

## ✅ Verificar se Funcionou

Após gerar o novo build e instalar no dispositivo:

1. **Abra o app**
2. **Veja os logs** no Logcat
3. **Deve aparecer:**
   ```
   [NotificationService] ✅ Push token obtido com sucesso
   [NotificationService] 📤 Registrando dispositivo no backend...
   [NotificationService] ✅ Resposta recebida do backend!
   ```

**E NÃO deve aparecer:**
```
❌ Default FirebaseApp is not initialized
```

---

## 📋 Checklist

- [ ] EAS CLI instalado
- [ ] Login no EAS feito (`eas login`)
- [ ] Credenciais FCM configuradas (`eas credentials`)
- [ ] Novo build gerado (`eas build -p android --profile preview`)
- [ ] APK instalado no dispositivo
- [ ] Logs mostram token obtido com sucesso
- [ ] Backend recebe requisição `/api/push/subscribe`
- [ ] Token aparece no banco de dados

---

## 🎯 Próximos Passos

1. ✅ **Configurar FCM** via `eas credentials`
2. ✅ **Gerar novo build** com Firebase configurado
3. ✅ **Instalar no dispositivo físico**
4. ✅ **Testar push notifications**

---

## 💡 Dica

A forma mais fácil é usar `eas credentials` - o EAS faz tudo automaticamente para você!

Boa sorte! 🚀

