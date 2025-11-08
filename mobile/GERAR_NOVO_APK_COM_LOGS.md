# 🔄 Gerar Novo APK com Logs e Firebase Configurado

## 🎯 Situação Atual

Você está vendo apenas este log no Logcat:
```
[Index] Sessão encontrada, usuário autenticado
```

Isso significa que o APK foi gerado **antes** das mudanças de logging serem feitas, ou o código de registro de notificações não está sendo executado.

---

## ✅ Solução: Gerar Novo APK

### Passo 1: Verificar Credenciais Firebase

Antes de gerar o APK, certifique-se de que as credenciais do Firebase estão configuradas:

```powershell
cd C:\Projetos\takepips\mobile
eas credentials
```

Escolha:
- **Android**
- **Push Notifications credentials**
- Verifique se está configurado (FCM Server Key ou FCM Legacy API Key)

---

### Passo 2: Gerar Novo APK

```powershell
cd C:\Projetos\takepips\mobile
eas build -p android --profile preview
```

**⏱️ Tempo estimado:** 10-15 minutos

---

### Passo 3: Instalar Novo APK

1. **Baixe o APK** do link fornecido pelo EAS Build
2. **Desinstale o app antigo** do celular (se necessário)
3. **Instale o novo APK**

---

### Passo 4: Verificar Logs no Logcat

1. **Abra o Android Studio**
2. **Abra o Logcat** (View > Tool Windows > Logcat ou Alt + 6)
3. **Limpe os logs** (ícone de lixeira)
4. **Aplique o filtro:**
   ```
   ReactNativeJS
   ```
5. **Feche o app** no celular (se estiver aberto)
6. **Abra o app TakePips** novamente
7. **Observe os logs aparecerem**

---

## 📊 Logs Esperados

Com o novo APK, você deve ver logs como:

```
[RootLayout] ✅ RootLayoutContent renderizado
[RootLayout] Hook usePushNotifications será chamado agora...
[usePushNotifications] ========================================
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[usePushNotifications] Platform: android
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] Device.isDevice: true
[NotificationService] Solicitando permissões...
[NotificationService] Permissão concedida: true
[NotificationService] Tentando obter Expo Push Token...
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] Token (primeiros 50 chars): ExponentPushToken[...]
[usePushNotifications] Passo 2: Registrando dispositivo no backend...
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] ✅ Resposta recebida do backend!
[NotificationService] ✅ Device registered successfully
```

---

## ❌ Se Ainda Não Aparecer os Logs

### Verificar se o Build Incluiu as Mudanças

1. **Confirme que o build foi feito DEPOIS** das mudanças de logging
2. **Verifique a data/hora do build** no EAS Dashboard

### Verificar Filtro do Logcat

1. **Remova todos os filtros** (clique no X)
2. **Procure manualmente** por `RootLayout` ou `NotificationService`
3. **Se aparecer**, o filtro pode estar incorreto

### Verificar se o App Está Rodando

1. **Certifique-se de que o app TakePips está realmente aberto** no celular
2. **Verifique se o app não está em background**

---

## 🔍 Filtros Recomendados para Logcat

### Filtro 1: Todos os Logs do JavaScript
```
ReactNativeJS
```

### Filtro 2: Apenas Logs de Notificações
```
ReactNativeJS RootLayout|usePushNotifications|NotificationService
```

### Filtro 3: Logs do App + JavaScript
```
package:com.takepips.mobile ReactNativeJS
```

---

## 📋 Checklist Antes de Gerar APK

- [ ] Credenciais Firebase configuradas (`eas credentials`)
- [ ] Mudanças de logging estão no código
- [ ] Código commitado (se usar Git)
- [ ] Pronto para esperar 10-15 minutos para o build

---

## 🚀 Comando Completo

```powershell
# 1. Ir para o diretório do mobile
cd C:\Projetos\takepips\mobile

# 2. Verificar credenciais (opcional)
eas credentials

# 3. Gerar APK
eas build -p android --profile preview

# 4. Aguardar conclusão (10-15 minutos)

# 5. Baixar e instalar APK no celular

# 6. Verificar logs no Android Studio Logcat
```

---

Boa sorte! 🚀

