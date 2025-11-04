# 📱 Guia de Push Notifications - TakePips Mobile

## ✅ O que foi implementado

O sistema de Push Notifications para o app nativo (APK) está **completamente implementado**:

### Backend
- ✅ Endpoint `/api/push/subscribe` que aceita Expo Push Tokens
- ✅ Envio automático via Expo Push API (`pushNotifications.ts`)
- ✅ Suporte para Web Push (PWA) e Expo Push (React Native) simultaneamente

### Mobile
- ✅ `NotificationService` configurado para Expo Push
- ✅ Hook `usePushNotifications` que registra automaticamente o dispositivo
- ✅ Integração automática no `_layout.tsx`
- ✅ Permissões solicitadas automaticamente
- ✅ Listeners configurados

## 🔧 Configuração Necessária

### 1. Criar tabela no Supabase

Execute o SQL no Supabase Dashboard (SQL Editor):

```sql
-- Criar tabela para Expo Push Tokens
CREATE TABLE IF NOT EXISTS expo_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'unknown',
  device_id TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expo_push_tokens_token ON expo_push_tokens(token);
CREATE INDEX idx_expo_push_tokens_platform ON expo_push_tokens(platform);
```

**Localização**: `supabase/migrations/create_expo_push_tokens.sql`

### 2. Gerar novo APK

```bash
cd mobile
eas build -p android --profile preview
```

### 3. Instalar e testar

1. Instale o APK no dispositivo Android
2. Abra o app
3. Conceda permissão para notificações
4. Verifique os logs do app

## 🧪 Como testar

### Verificar se o token foi registrado

No Supabase Dashboard:

```sql
SELECT * FROM expo_push_tokens ORDER BY created_at DESC;
```

Você deve ver algo como:
```
token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
platform: android
device_id: Pixel 7
```

### Testar notificação manual

Via Postman ou curl:

```bash
curl -X POST https://takepips.vercel.app/api/push/test \
  -H "Content-Type: application/json"
```

### Verificar logs no Vercel

Acesse: https://vercel.com/guustavogomes/takepips/logs

Procure por:
```
[PUSH] Expo Push enviado para X dispositivo(s)
```

## 🔍 Troubleshooting

### Token não aparece no banco

**Logs para verificar no app:**
```
[usePushNotifications] Iniciando registro...
[usePushNotifications] Token obtido: ExponentPushToken[...]
[usePushNotifications] ✅ Dispositivo registrado com sucesso!
```

**Se não aparecer:**
1. Verifique permissões no dispositivo (Configurações > Apps > TakePips > Notificações)
2. Reinstale o app
3. Verifique se não está usando emulador (não funciona em emuladores)

### Notificação não chega

**Verifique:**
1. ✅ Token está no banco? (query SQL acima)
2. ✅ Logs do Vercel mostram envio?
3. ✅ App está fechado ou em background? (notificações só aparecem assim)
4. ✅ Notificações estão habilitadas no dispositivo?

### Logs úteis

**Mobile (via `npx expo start`):**
```
[NotificationService] Push token obtido com sucesso
[usePushNotifications] ✅ Dispositivo registrado com sucesso!
```

**Backend (Vercel):**
```
[PUSH] ✅ Expo Push enviado para 1 dispositivo(s)
[PUSH] Resultado: { data: [...] }
```

## 📊 Fluxo completo

1. **App abre** → `_layout.tsx`
2. **Hook ativa** → `usePushNotifications()`
3. **Solicita permissão** → `NotificationService.requestPermissions()`
4. **Obtém token** → `NotificationService.getExpoPushToken()`
5. **Registra no backend** → `POST /api/push/subscribe`
6. **Backend salva** → Tabela `expo_push_tokens`
7. **Sinal criado/atualizado** → Backend chama `sendPushNotification()`
8. **Backend busca tokens** → Query em `expo_push_tokens`
9. **Envia via Expo** → `POST https://exp.host/--/api/v2/push/send`
10. **Dispositivo recebe** → Notificação aparece

## 🎯 Diferenças: PWA vs APK

| Aspecto | PWA (Web) | APK (Nativo) |
|---------|-----------|--------------|
| Tecnologia | Web Push (VAPID) | Expo Push |
| Tabela | `push_subscriptions` | `expo_push_tokens` |
| Token | Subscription object | ExponentPushToken[...] |
| API | WebPush library | Expo Push API |
| Funciona em | Navegadores | Apps nativos |

## ✨ Recursos

- **Automático**: Registro acontece ao abrir o app
- **Silencioso**: Não incomoda o usuário desnecessariamente
- **Resiliente**: Trata erros graciosamente
- **Logs**: Detalhados para debugging
- **Performance**: Não bloqueia UI

## 🔗 Links úteis

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Testing Push Notifications](https://expo.dev/notifications)
