# 🚀 Setup do TakePips Mobile App

Guia completo para configurar e executar o aplicativo React Native.

## 📋 Pré-requisitos

1. **Node.js** 18+ instalado
2. **npm** ou **yarn**
3. **Expo CLI** (opcional, mas recomendado)
4. **iOS Simulator** (Mac) ou dispositivo físico iOS
5. **Backend TakePips** rodando e acessível

## 🔧 Instalação

### 1. Instalar dependências

```bash
cd mobile
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto `mobile/`:

```env
API_URL=https://your-backend-url.vercel.app
EAS_PROJECT_ID=your-project-id
```

Ou configure no `app.config.js`:

```javascript
extra: {
  apiUrl: 'https://your-backend-url.vercel.app',
  eas: {
    projectId: 'your-project-id',
  },
}
```

### 3. Configurar o backend

Certifique-se de que o backend está configurado para aceitar tokens Expo:

- ✅ Endpoint `/api/push/subscribe` atualizado para suportar tokens Expo
- ✅ Tabela `expo_push_tokens` criada no banco de dados
- ✅ Função `sendPushNotification` atualizada para enviar via Expo

## 🏃 Executar o App

### Desenvolvimento

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou com Expo CLI
expo start
```

Depois:
- Pressione `i` para iOS Simulator
- Pressione `a` para Android Emulator
- Escaneie o QR code com Expo Go no dispositivo físico

### Build para produção

#### iOS

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar projeto
eas build:configure

# Build para iOS
eas build --platform ios

# Build para produção
eas build --platform ios --profile production
```

#### Android

```bash
eas build --platform android
```

## 📱 Configurar Notificações iOS

### 1. Criar projeto EAS

Se ainda não tiver um projeto EAS:

```bash
eas init
```

Isso criará um `projectId` no `app.json`.

### 2. Configurar certificados iOS

```bash
eas credentials
```

Siga as instruções para configurar:
- Apple Developer Account
- Provisioning Profiles
- Push Notification Certificates

### 3. Testar notificações

1. Execute o app em um dispositivo físico iOS
2. Permita notificações quando solicitado
3. O app registrará automaticamente o dispositivo
4. Teste enviando notificações do backend

## 🔔 Como Funciona

### Fluxo de Notificações

1. **App inicia** → Solicita permissão de notificações
2. **Permissão concedida** → Obtém Expo Push Token
3. **Token registrado** → Envia para `/api/push/subscribe`
4. **Backend salva** → Token armazenado em `expo_push_tokens`
5. **Sinal atualizado** → Backend envia notificação via Expo Push Service
6. **App recebe** → Notificação aparece no dispositivo

### Estrutura de Dados

**Tabela: `expo_push_tokens`**
```sql
CREATE TABLE expo_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  platform TEXT,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## 🐛 Troubleshooting

### Notificações não funcionam

1. **Verificar permissões:**
   - iOS: Settings → TakePips → Notifications → Allow Notifications

2. **Verificar token:**
   - Veja o console do app ao iniciar
   - Verifique se o token foi registrado no backend

3. **Verificar backend:**
   - Logs devem mostrar tentativas de envio
   - Verifique se há erros na requisição para Expo

4. **Testar manualmente:**
   ```bash
   # No backend, teste enviar uma notificação
   curl -X POST https://exp.host/--/api/v2/push/send \
     -H "Content-Type: application/json" \
     -d '{
       "to": "ExponentPushToken[seu-token]",
       "title": "Teste",
       "body": "Notificação de teste"
     }'
   ```

### Erro de conexão com API

1. Verifique se `API_URL` está correto
2. Verifique se o backend está acessível
3. Verifique CORS no backend

### Erro de build

1. Limpe o cache:
   ```bash
   expo start --clear
   ```

2. Reinstale dependências:
   ```bash
   rm -rf node_modules
   npm install
   ```

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native](https://reactnative.dev/)

## 🎯 Próximos Passos

1. ✅ Configurar EAS Project ID
2. ✅ Configurar certificados iOS
3. ✅ Testar notificações em dispositivo físico
4. ✅ Fazer build de produção
5. ✅ Publicar na App Store (opcional)

## 📝 Notas

- Para desenvolvimento, use Expo Go
- Para produção, use EAS Build
- Notificações só funcionam em dispositivos físicos (não em simuladores)
- Certifique-se de que o backend está configurado corretamente
