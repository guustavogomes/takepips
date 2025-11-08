# 🚀 Configurar FCM V1 - Passo a Passo Completo

## 🎯 Situação

A API Cloud Messaging (legada) está **desativada**. Você **DEVE** usar **FCM V1** (HTTP v1).

---

## ✅ Solução: Configurar FCM V1 via EAS

O EAS pode configurar tudo automaticamente! É a forma mais fácil.

---

## 📋 Passo a Passo

### Passo 1: Abrir Terminal

Abra o PowerShell ou Terminal e execute:

```powershell
cd C:\Projetos\takepips\mobile
```

### Passo 2: Executar EAS Credentials

```powershell
eas credentials
```

### Passo 3: Selecionar Opções

O EAS vai mostrar um menu. Selecione:

1. **Select platform:**
   - Digite: `android`
   - Pressione Enter

2. **What would you like to manage?**
   - Escolha: `Push Notifications (FCM)`
   - Pressione Enter

3. **Select FCM credential type:**
   - **IMPORTANTE:** Escolha: `FCM V1: Google Service Account Key For FCM V1`
   - **NÃO escolha:** `FCM Legacy: Server Key` (está desativado!)
   - Pressione Enter

4. **What would you like to do?**
   - Escolha: `Set up new credentials`
   - Pressione Enter

### Passo 4: EAS Configura Automaticamente

O EAS vai:
- ✅ Criar um projeto Firebase (se necessário)
- ✅ Configurar Google Service Account
- ✅ Fazer upload das credenciais
- ✅ Configurar tudo automaticamente

**Você só precisa aguardar!** ⏳

---

## 📊 O Que Você Deve Ver

Durante o processo, você verá mensagens como:

```
✓ Created Firebase project: takepips-xxxxx
✓ Created Google Service Account
✓ Uploaded credentials to EAS
✓ FCM V1 credentials configured successfully
```

---

## ✅ Após Configurar

### Passo 5: Gerar Novo Build

Após as credenciais serem configuradas:

```powershell
eas build -p android --profile preview
```

**⏱️ Tempo:** 10-15 minutos

---

### Passo 6: Instalar e Testar

1. **Aguarde o build completar**
2. **Baixe o APK** do link fornecido
3. **Instale no dispositivo**
4. **Abra o app**
5. **Verifique os logs** no Logcat

**Deve aparecer:**
```
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] 📤 Registrando dispositivo no backend...
```

**E NÃO deve aparecer:**
```
❌ Default FirebaseApp is not initialized
```

---

## 🎯 Resumo dos Comandos

```powershell
# 1. Ir para o diretório
cd C:\Projetos\takepips\mobile

# 2. Configurar credenciais FCM V1
eas credentials
# Escolha: android > Push Notifications (FCM) > FCM V1 > Set up new credentials

# 3. Aguardar configuração automática

# 4. Gerar build
eas build -p android --profile preview

# 5. Instalar APK e testar
```

---

## ❓ Perguntas Frequentes

### P: Preciso criar projeto Firebase manualmente?

**R:** Não! O EAS cria automaticamente se você escolher FCM V1.

### P: Preciso baixar arquivo JSON?

**R:** Não! O EAS gerencia tudo automaticamente.

### P: E se eu já tiver um projeto Firebase?

**R:** O EAS vai usar o projeto existente ou criar um novo. Tudo automático!

### P: Quanto tempo demora?

**R:** A configuração das credenciais leva 1-2 minutos. O build leva 10-15 minutos.

---

## 📋 Checklist

- [ ] Executar `eas credentials`
- [ ] Escolher `android`
- [ ] Escolher `Push Notifications (FCM)`
- [ ] **Escolher `FCM V1` (NÃO Legacy!)**
- [ ] Escolher `Set up new credentials`
- [ ] Aguardar configuração automática
- [ ] Gerar build (`eas build -p android --profile preview`)
- [ ] Instalar APK no dispositivo
- [ ] Verificar logs - token deve ser obtido com sucesso

---

## 🚀 Pronto!

Depois de seguir estes passos, o Firebase estará configurado e as push notifications funcionarão no Android!

Boa sorte! 🎉

