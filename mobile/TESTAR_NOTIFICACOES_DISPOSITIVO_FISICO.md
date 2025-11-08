# 📱 Como Testar Push Notifications em Dispositivo Físico

## ✅ Requisitos

- ✅ Dispositivo Android físico
- ✅ Cabo USB
- ✅ Android Studio instalado (para ver logs)
- ✅ APK gerado com `eas build` (ou usar Expo Go para desenvolvimento)

---

## 🚀 Opção 1: Usar APK Gerado (Recomendado para Produção)

### Passo 1: Gerar APK

```powershell
cd C:\Projetos\takepips\mobile
eas build -p android --profile preview
```

**Isso vai:**
- Gerar um APK com todas as funcionalidades
- Incluir push notifications funcionando
- Demorar cerca de 10-20 minutos

### Passo 2: Baixar e Instalar APK

1. **Aguarde o build completar**
2. **Baixe o APK** do link fornecido pelo EAS
3. **Transfira para o dispositivo** (via USB ou download direto)
4. **Instale o APK** no dispositivo:
   - Vá em **Configurações** > **Segurança** > Ative **Fontes desconhecidas**
   - Abra o arquivo APK e instale

### Passo 3: Conectar Dispositivo e Ver Logs

1. **Conecte o dispositivo via USB**
2. **Ative Depuração USB** no dispositivo
3. **Abra Android Studio** > **Logcat**
4. **Filtre por:** `RootLayout|usePushNotifications|NotificationService`
5. **Abra o app TakePips** no dispositivo
6. **Observe os logs aparecerem**

---

## 🚀 Opção 2: Usar Expo Go (Rápido para Desenvolvimento)

### ⚠️ IMPORTANTE: Expo Go NÃO Suporta Push Notifications!

Expo Go **não suporta push notifications remotas** a partir do SDK 53. Se você tentar, verá:

```
[NotificationService] ⚠️ Expo Go detectado - push notifications remotas não disponíveis
```

**Para testar push notifications, você DEVE usar um APK gerado com `eas build`.**

---

## 🚀 Opção 3: Development Build (Melhor para Desenvolvimento)

### Passo 1: Gerar Development Build

```powershell
cd C:\Projetos\takepips\mobile
npx expo start

```

**Vantagens:**
- ✅ Push notifications funcionam
- ✅ Hot reload funciona
- ✅ Mais rápido que production build
- ✅ Pode instalar via USB diretamente

### Passo 2: Instalar no Dispositivo

Após o build completar:

```powershell
# Instalar via USB (se o dispositivo estiver conectado)
adb install -r caminho/do/apk.apk
```

Ou baixe e instale manualmente como na Opção 1.

---

## 🔍 Ver Logs do Dispositivo Físico

### Método 1: Android Studio Logcat (Recomendado)

1. **Conecte o dispositivo via USB**
2. **Ative Depuração USB** no dispositivo
3. **Aceite a autorização** quando aparecer
4. **Abra Android Studio**
5. **Vá em View > Tool Windows > Logcat**
6. **Selecione seu dispositivo** no dropdown
7. **Filtre por:**
   ```
   RootLayout|usePushNotifications|NotificationService
   ```
8. **Abra o app** no dispositivo
9. **Observe os logs aparecerem**

### Método 2: Terminal (ADB)

```powershell
# Verificar dispositivo conectado
adb devices

# Limpar logs
adb logcat -c

# Ver logs filtrados
adb logcat | Select-String -Pattern "RootLayout|usePushNotifications|NotificationService"
```

---

## ✅ O Que Você Deve Ver nos Logs (Sucesso)

Quando o app abrir no dispositivo físico, você deve ver:

```
[RootLayout] ✅ RootLayoutContent renderizado
[RootLayout] Hook usePushNotifications será chamado agora...
[usePushNotifications] ========================================
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[usePushNotifications] Platform: android
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone  ← DEVE SER "standalone"
[NotificationService] isExpoGo: false  ← DEVE SER false
[NotificationService] Device.isDevice: true  ← DEVE SER true
[NotificationService] Solicitando permissões...
[NotificationService] Permissão concedida: true  ← DEVE SER true
[NotificationService] Tentando obter Expo Push Token...
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] Token completo: ExponentPushToken[...]
[usePushNotifications] ✅ Token obtido com sucesso!
[usePushNotifications] Passo 2: Registrando dispositivo no backend...
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] API URL: https://takepips.vercel.app
[NotificationService] Endpoint completo: https://takepips.vercel.app/api/push/subscribe
[NotificationService] Fazendo requisição POST...
[NotificationService] ✅ Resposta recebida do backend!
[NotificationService] ✅ Device registered successfully
[usePushNotifications] ✅ Dispositivo registrado com sucesso no backend!
```

**E nos logs do backend (Vercel) deve aparecer:**
```
[API] POST /api/push/subscribe - ...
[API] ✅ Expo Push Token salvo com sucesso
```

---

## 🔍 Verificar se Funcionou

### 1. Verificar Logs do Backend

Acesse: https://vercel.com/dashboard
- Selecione projeto **takepips**
- Vá em **Deployments** > **Function Logs**
- Procure por: `[API] POST /api/push/subscribe`

### 2. Verificar Banco de Dados

Execute no Supabase:

```sql
SELECT * FROM expo_push_tokens ORDER BY created_at DESC;
```

**Deve retornar pelo menos 1 registro!**

### 3. Testar Enviando Notificação

Crie um novo sinal no backend. Você deve receber a notificação no dispositivo!

---

## ❌ Problemas Comuns

### Problema 1: App Detectado como Expo Go

```
[NotificationService] Constants.appOwnership: expo
[NotificationService] ⚠️ Expo Go detectado
```

**Solução**: Use um APK gerado com `eas build`, não o Expo Go.

### Problema 2: Permissões Negadas

```
[NotificationService] Permissão concedida: false
```

**Solução**: 
1. Vá em **Configurações** > **Apps** > **TakePips** > **Notificações**
2. Ative as notificações
3. Reabra o app

### Problema 3: Erro de Rede

```
[NotificationService] ❌ Requisição feita mas sem resposta do servidor
```

**Solução**: 
- Verifique conexão de internet
- Verifique se a URL do backend está correta

### Problema 4: Nenhum Log Aparece

**Solução**: 
- Certifique-se de que o APK foi gerado **depois** das mudanças de logs
- Verifique se o dispositivo está conectado: `adb devices`
- Tente limpar e reinstalar o app

---

## 📋 Checklist Completo

- [ ] Dispositivo Android físico conectado via USB
- [ ] Depuração USB ativada no dispositivo
- [ ] APK gerado com `eas build` (não Expo Go)
- [ ] APK instalado no dispositivo
- [ ] Android Studio aberto com Logcat
- [ ] Filtro aplicado: `RootLayout|usePushNotifications|NotificationService`
- [ ] App aberto no dispositivo
- [ ] Logs aparecendo no Logcat
- [ ] Verificar logs do backend (Vercel)
- [ ] Verificar banco de dados (Supabase)

---

## 🎯 Resumo das Opções

| Opção | Push Notifications | Hot Reload | Velocidade | Recomendado Para |
|-------|-------------------|------------|------------|------------------|
| **APK Preview** | ✅ Sim | ❌ Não | 🐌 Lento (10-20min) | Teste final |
| **Development Build** | ✅ Sim | ✅ Sim | 🚀 Rápido (5-10min) | Desenvolvimento |
| **Expo Go** | ❌ Não | ✅ Sim | ⚡ Instantâneo | Outras funcionalidades |

---

## 🚀 Próximos Passos

1. ✅ **Gerar APK** com `eas build -p android --profile preview`
2. ✅ **Instalar no dispositivo físico**
3. ✅ **Conectar dispositivo e abrir Logcat**
4. ✅ **Abrir o app e ver logs**
5. ✅ **Verificar se token foi registrado no banco**
6. ✅ **Testar enviando notificação**

Boa sorte! 🎉

