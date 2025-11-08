# 🔍 Procurar Logs de Notificações no Logcat

## 🎯 Situação

Você está vendo logs do app (ReactNativeJS), mas não está vendo os logs de notificações que adicionamos.

---

## 🚀 Solução: Filtros Específicos

### Filtro 1: Apenas ReactNativeJS

No campo de filtro do Logcat, digite:

```
ReactNativeJS
```

Isso mostra **todos os logs do JavaScript/React Native**, incluindo os logs que adicionamos.

---

### Filtro 2: Procurar por Tags Específicas

```
ReactNativeJS RootLayout|usePushNotifications|NotificationService
```

---

### Filtro 3: Ver Tudo do App (Mais Amplo)

```
package:com.takepips.mobile ReactNativeJS
```

---

## 🔍 O Que Procurar

Procure especificamente por estas linhas nos logs:

1. `[RootLayout] ✅ RootLayoutContent renderizado`
2. `[usePushNotifications] 🚀 Iniciando registro`
3. `[NotificationService] getExpoPushToken chamado`
4. `[NotificationService] Constants.appOwnership`
5. `[NotificationService] ✅ Push token obtido`

---

## ❓ Se Não Aparecer Nenhum Log de Notificações

### Possível Causa 1: APK Gerado Antes das Mudanças

O APK pode ter sido gerado **antes** de adicionarmos os logs.

**Solução:**
1. Gere um novo APK com as mudanças de logs:
   ```powershell
   cd C:\Projetos\takepips\mobile
   eas build -p android --profile preview
   ```
2. Instale o novo APK no dispositivo
3. Teste novamente

### Possível Causa 2: Logs Não Estão Sendo Executados

O código de notificações pode não estar sendo executado.

**Verificar:**
1. Procure por `ReactNativeJS` nos logs
2. Se aparecer outros logs do app, mas não os de notificações, o código pode não estar sendo executado

---

## 📊 Logs Esperados

Quando o app abrir, você deve ver (no filtro `ReactNativeJS`):

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

## 💡 Dica: Limpar e Recarregar

1. **Limpe os logs** (ícone de lixeira)
2. **Aplique o filtro:** `ReactNativeJS`
3. **Feche o app** completamente no celular
4. **Abra o app novamente**
5. **Observe os logs desde o início**

---

## 🎯 Filtro Recomendado

**Use este filtro para ver todos os logs do JavaScript:**
```
ReactNativeJS
```

**Depois procure manualmente por:**
- `RootLayout`
- `usePushNotifications`
- `NotificationService`

---

Boa sorte! 🚀

