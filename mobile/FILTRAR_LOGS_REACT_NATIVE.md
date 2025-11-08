# 🔍 Filtrar Logs do React Native/Expo no Logcat

## 🎯 Problema

Você está vendo logs do sistema Android (gralloc4, HandWritingStubImpl, etc.), mas não está vendo os logs do app React Native.

---

## 🚀 Solução: Filtros Específicos

### Método 1: Filtrar por Tags do App (Recomendado)

No campo de filtro do Logcat, digite:

```
RootLayout|usePushNotifications|NotificationService|ReactNative|ReactNativeJS
```

Isso mostra apenas os logs que contêm essas tags.

---

### Método 2: Filtrar por Package + Tags

```
package:com.takepips.mobile tag:RootLayout|tag:usePushNotifications|tag:NotificationService
```

---

### Método 3: Filtrar por Nível de Log

Para ver apenas logs importantes (Info, Warning, Error):

```
package:com.takepips.mobile level:info|level:warn|level:error
```

---

### Método 4: Combinar Tudo (Mais Específico)

```
package:com.takepips.mobile RootLayout|usePushNotifications|NotificationService|ReactNative
```

---

## 🔄 Limpar Logs e Recomeçar

1. **Clique no ícone de lixeira** no Logcat para limpar os logs
2. **Aplique o filtro:**
   ```
   RootLayout|usePushNotifications|NotificationService
   ```
3. **Feche o app** no celular (se estiver aberto)
4. **Abra o app TakePips** novamente no celular
5. **Observe os logs aparecerem desde o início**

---

## 📊 O Que Você Deve Ver

Quando abrir o app, você deve ver logs como:

```
[RootLayout] ✅ RootLayoutContent renderizado
[RootLayout] Hook usePushNotifications será chamado agora...
[usePushNotifications] ========================================
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] ✅ Push token obtido com sucesso
```

---

## ❓ Se Ainda Não Aparecer

### Verificar se o App Está Rodando

1. **Certifique-se de que o app TakePips está realmente aberto** no celular
2. **Verifique se o app não está em background**

### Verificar Filtro

1. **Limpe o filtro** (clique no X)
2. **Procure manualmente** por `RootLayout` ou `NotificationService` nos logs
3. **Se aparecer**, o filtro pode estar incorreto

### Verificar se o Build Tem os Logs

1. **Certifique-se de que o APK foi gerado DEPOIS** das mudanças de logs
2. **Se não, gere um novo build:**
   ```powershell
   eas build -p android --profile preview
   ```

---

## 💡 Dica: Ver Todos os Logs do App

Se quiser ver TODOS os logs do app (não apenas os filtrados):

```
package:com.takepips.mobile
```

Isso mostra todos os logs do app, incluindo logs do React Native, sistema, etc.

---

## 📋 Checklist

- [ ] Logs limpos (ícone de lixeira)
- [ ] Filtro aplicado: `RootLayout|usePushNotifications|NotificationService`
- [ ] App fechado no celular
- [ ] App aberto novamente no celular
- [ ] Logs aparecendo desde o início

---

## 🎯 Filtro Recomendado Final

**Use este filtro para ver apenas os logs importantes do app:**
```
package:com.takepips.mobile RootLayout|usePushNotifications|NotificationService|ReactNativeJS
```

Boa sorte! 🚀

