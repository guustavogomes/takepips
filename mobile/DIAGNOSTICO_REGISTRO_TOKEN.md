# 🔍 Diagnóstico: Registro de Token Expo Push

## 📊 Situação Atual

- ✅ **Backend funcionando**: Web Push está enviando notificações (2 subscriptions)
- ❌ **App não registra token**: 0 tokens Expo no banco de dados
- ❌ **Nenhuma requisição para `/api/push/subscribe`** nos logs do backend

## 🔧 Mudanças Realizadas

### 1. Logs Adicionados no App

#### `usePushNotifications.ts`
- Logs detalhados em cada etapa do registro
- Identificação clara de onde o processo pode estar falhando

#### `NotificationService.ts`
- Logs detalhados ao obter token Expo
- Verificação de `Constants.appOwnership` (deve ser `standalone`, não `expo`)
- Verificação de permissões
- Logs detalhados ao registrar no backend
- Logs de erro completos com stack trace

## 📱 Como Testar

### 1. Gerar Novo APK

```bash
cd mobile
eas build -p android --profile preview
```

### 2. Instalar APK no Dispositivo

### 3. Verificar Logs do App

#### Opção A: Usando `adb logcat` (Android)

```bash
# Conectar dispositivo via USB
adb devices

# Filtrar logs do app
adb logcat | grep -E "\[usePushNotifications\]|\[NotificationService\]"
```

#### Opção B: Usando React Native Debugger

1. Abra o app no dispositivo
2. Conecte o dispositivo ao computador
3. Abra o React Native Debugger
4. Veja os logs no console

### 4. O Que Procurar nos Logs

#### ✅ **Sucesso Esperado:**

```
[usePushNotifications] ========================================
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[usePushNotifications] Platform: android
[usePushNotifications] ========================================
[usePushNotifications] Passo 1: Obtendo token Expo Push...
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone  ← DEVE SER "standalone"
[NotificationService] isExpoGo: false  ← DEVE SER false
[NotificationService] Device.isDevice: true  ← DEVE SER true
[NotificationService] Solicitando permissões...
[NotificationService] Permissão concedida: true  ← DEVE SER true
[NotificationService] Tentando obter Expo Push Token...
[NotificationService] ✅ Push token obtido com sucesso
[usePushNotifications] ✅ Token obtido com sucesso!
[usePushNotifications] Passo 2: Registrando dispositivo no backend...
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] API URL: https://takepips.vercel.app
[NotificationService] Endpoint completo: https://takepips.vercel.app/api/push/subscribe
[NotificationService] Fazendo requisição POST...
[NotificationService] ✅ Resposta recebida do backend!
[usePushNotifications] ✅ Dispositivo registrado com sucesso no backend!
```

#### ❌ **Possíveis Problemas:**

**1. App detectado como Expo Go:**
```
[NotificationService] Constants.appOwnership: expo  ← PROBLEMA!
[NotificationService] ⚠️ Expo Go detectado - push notifications remotas não disponíveis
```
**Solução**: O APK deve ser gerado com `eas build`, não rodado no Expo Go.

**2. Permissões negadas:**
```
[NotificationService] Permissão concedida: false  ← PROBLEMA!
[NotificationService] ❌ Permissão negada - não é possível obter token
```
**Solução**: Vá em Configurações do Android > Apps > TakePips > Notificações e ative.

**3. Erro de rede:**
```
[NotificationService] ❌ Requisição feita mas sem resposta do servidor
```
**Solução**: Verifique conexão de internet e URL do backend.

**4. Erro 404 ou 500:**
```
[NotificationService] Response status: 404
[NotificationService] Response data: {...}
```
**Solução**: Verifique se o endpoint `/api/push/subscribe` está deployado.

### 5. Verificar Logs do Backend

Após abrir o app, verifique os logs da Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `takepips`
3. Vá em "Deployments" > Último deploy > "Functions" > "View Function Logs"
4. Procure por: `[API] POST /api/push/subscribe`

**Se aparecer:**
```
[API] POST /api/push/subscribe - 2025-11-07T...
[API] ✅ Expo Push Token salvo com sucesso
```
✅ **Token foi registrado!**

**Se não aparecer:**
❌ O app não está conseguindo fazer a requisição (ver logs do app para identificar o erro).

### 6. Verificar no Banco de Dados

Após abrir o app, execute no Supabase:

```sql
SELECT * FROM expo_push_tokens ORDER BY created_at DESC;
```

**Se retornar registros:**
✅ **Token foi salvo!**

**Se não retornar nada:**
❌ O app não está registrando (ver logs do app).

## 🎯 Próximos Passos

1. ✅ Gerar novo APK com os logs adicionados
2. ✅ Instalar no dispositivo
3. ✅ Verificar logs do app (usando `adb logcat` ou React Native Debugger)
4. ✅ Verificar logs do backend (Vercel)
5. ✅ Verificar banco de dados (Supabase)

Compartilhe os logs encontrados para identificarmos exatamente onde está o problema!

