# ⚠️ Expo Go - Warning de Notificações

## 🔍 O que é esse erro?

Você está vendo este erro/warning:

```
ERROR  expo-notifications: Android Push notifications (remote notifications)
functionality provided by expo-notifications was removed from Expo Go with
the release of SDK 53.
```

## ✅ PODE IGNORAR - O App Funciona Normalmente!

Este é um **WARNING esperado** quando você usa Expo Go para desenvolvimento.

### Por que aparece?

A partir do Expo SDK 53, push notifications **remotas** foram removidas do Expo Go devido a limitações técnicas. Mas isso **NÃO IMPEDE** o app de funcionar!

## 📱 O que funciona e o que não funciona?

### ✅ Funciona no Expo Go:
- ✅ **Notificações Locais** - Totalmente funcionais
- ✅ **Todas as telas do app** (Home, Educação, Sinais, Ferramentas, Perfil)
- ✅ **Vídeos do YouTube**
- ✅ **Calculadoras e ferramentas**
- ✅ **E-books e conteúdo educacional**
- ✅ **Navegação entre tabs**
- ✅ **99% das funcionalidades do app**

### ⚠️ Não funciona no Expo Go:
- ❌ Push Notifications **remotas** (do servidor)

## 🎯 Para o Desenvolvimento

Você pode **continuar desenvolvendo normalmente**! Use notificações locais para testar:

```typescript
import { sendTestNotification } from '@/infrastructure/services/LocalNotificationHelper';

// Testar notificação local (funciona no Expo Go)
await sendTestNotification();
```

## 🚀 Para Produção

Quando for lançar o app em produção, você tem 3 opções:

### Opção 1: EAS Build (Recomendado)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Build de desenvolvimento
eas build --profile development --platform android
```

### Opção 2: Development Build
```bash
npx expo run:android
# ou
npx expo run:ios
```

### Opção 3: Continue sem Push Remotas
Se você não precisa de push notifications remotas, pode simplesmente ignorar o erro e continuar usando notificações locais!

## 🔧 Como Suprimir o Erro?

O código já foi atualizado para detectar Expo Go e não tentar usar push remotas. O erro ainda aparece porque vem de dentro do módulo `expo-notifications`, mas **não afeta o funcionamento**.

Para silenciar completamente, você precisaria remover `expo-notifications` do projeto, mas isso removeria notificações locais também.

## 📚 Referências

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

## 💡 TL;DR (Resumo)

**Ignorar o erro está OK!**

- ✅ O app funciona normalmente
- ✅ Notificações locais funcionam
- ✅ Todas as telas funcionam
- ❌ Apenas push remotas não funcionam no Expo Go
- 🚀 Para produção, use EAS Build

**Continue desenvolvendo sem preocupações!** 🎉

---

**Última atualização**: 2025-11-03
