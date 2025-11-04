# 📱 Configuração de Notificações Push - TakePips Mobile

## ⚠️ Warning Atual

```
WARN  expo-notifications: Android Push Notifications...
```

Este warning aparece durante o desenvolvimento porque as notificações push do Android requerem configuração do **Firebase Cloud Messaging (FCM)**.

## 🔧 Status Atual

✅ **Desenvolvimento Local**: Notificações locais funcionam normalmente
⚠️ **Push Notifications (Android)**: Requer configuração do Firebase (apenas para produção)
✅ **Push Notifications (iOS)**: Configuradas automaticamente pelo Expo

## 🚀 Para Desenvolvimento (Ignorar Warning)

O warning pode ser ignorado com segurança durante o desenvolvimento. As notificações locais continuarão funcionando.

### Configuração Atual (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#FFD700",
          "mode": "development"
        }
      ]
    ],
    "android": {
      "useNextNotificationsApi": true,
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "POST_NOTIFICATIONS"
      ]
    }
  }
}
```

## 📦 Para Produção: Configurar Firebase (Opcional)

Se você precisar de push notifications remotas no Android em produção, siga estes passos:

### 1. Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: **TakePips**
4. Desabilite Google Analytics (opcional)

### 2. Adicionar App Android ao Firebase

1. No console do Firebase, clique em "Android"
2. Nome do pacote Android: `com.takepips.mobile`
3. Apelido do app: TakePips Mobile
4. Baixe o arquivo `google-services.json`
5. Coloque o arquivo na raiz do diretório `mobile/`

### 3. Atualizar app.json

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#FFD700",
          "mode": "production"
        }
      ]
    ]
  }
}
```

### 4. Build com EAS

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar build
eas build:configure

# Build para Android
eas build --platform android
```

## 🧪 Testar Notificações Locais (Sem Firebase)

Durante o desenvolvimento, você pode testar notificações locais:

```typescript
import * as Notifications from 'expo-notifications';

// Configurar handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Enviar notificação local
async function sendLocalNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 Novo Sinal GOLD",
      body: "GOLD (XAU/USD) - BUY em 2050.00",
      data: { signal: 'gold-buy' },
    },
    trigger: { seconds: 2 },
  });
}
```

## 📋 Checklist de Configuração

### Desenvolvimento ✅
- [x] Notificações locais configuradas
- [x] Permissões do Android adicionadas
- [x] Ícone de notificação definido
- [x] Cor de notificação (dourado #FFD700)

### Produção (Opcional) ⚠️
- [ ] Projeto Firebase criado
- [ ] `google-services.json` baixado
- [ ] Arquivo adicionado ao projeto
- [ ] app.json atualizado com googleServicesFile
- [ ] Build com EAS configurado

## 🔍 Troubleshooting

### Warning persiste após configuração

```bash
# Limpar cache do Metro
npx expo start --clear

# Limpar node_modules e reinstalar
cd mobile
rm -rf node_modules
npm install
```

### Notificações não aparecem

```typescript
// Verificar permissões
const { status } = await Notifications.getPermissionsAsync();
if (status !== 'granted') {
  await Notifications.requestPermissionsAsync();
}
```

## 📚 Referências

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**Status**: ✅ Configurado para desenvolvimento
**Push Remoto**: ⚠️ Requer Firebase (apenas para produção)
**Última atualização**: 2025-11-03
