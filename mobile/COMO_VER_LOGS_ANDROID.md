# 📱 Como Ver Logs do App Android

## 🎯 Objetivo

Ver os logs do app TakePips para diagnosticar por que o token Expo Push não está sendo registrado.

## 📋 Pré-requisitos

1. Dispositivo Android conectado via USB
2. USB Debugging ativado no dispositivo
3. ADB instalado (vem com Android SDK)

## 🔧 Passo a Passo

### 1. Conectar Dispositivo

```bash
# Verificar se o dispositivo está conectado
adb devices
```

**Saída esperada:**
```
List of devices attached
ABC123XYZ    device
```

Se aparecer "unauthorized", aceite a autorização no dispositivo.

### 2. Ver Logs do App

#### Opção A: Filtrar apenas logs do TakePips

```bash
# Filtrar logs relacionados a notificações
adb logcat | grep -E "\[usePushNotifications\]|\[NotificationService\]|\[RootLayout\]"
```

#### Opção B: Ver todos os logs e filtrar depois

```bash
# Ver todos os logs
adb logcat

# Pressione Ctrl+C para parar
```

#### Opção C: Salvar logs em arquivo

```bash
# Salvar logs em arquivo
adb logcat > logs_android.txt

# Depois pressione Ctrl+C para parar
# Abra o arquivo logs_android.txt para ver os logs
```

### 3. Limpar Logs Antigos

```bash
# Limpar logs antigos antes de testar
adb logcat -c
```

### 4. Testar o App

1. Abra o app TakePips no dispositivo
2. Aguarde alguns segundos
3. Veja os logs aparecerem no terminal

## 🔍 O Que Procurar

### ✅ Logs de Sucesso Esperados:

```
[RootLayout] Auth state changed: ...
[usePushNotifications] ========================================
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[usePushNotifications] Platform: android
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] isExpoGo: false
[NotificationService] Device.isDevice: true
[NotificationService] Solicitando permissões...
[NotificationService] Permissão concedida: true
[NotificationService] Tentando obter Expo Push Token...
[NotificationService] ✅ Push token obtido com sucesso
[usePushNotifications] ✅ Token obtido com sucesso!
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] API URL: https://takepips.vercel.app
[NotificationService] Fazendo requisição POST...
[NotificationService] ✅ Resposta recebida do backend!
```

### ❌ Possíveis Problemas:

**1. App detectado como Expo Go:**
```
[NotificationService] Constants.appOwnership: expo
[NotificationService] ⚠️ Expo Go detectado
```
**Solução**: O APK deve ser gerado com `eas build`, não rodado no Expo Go.

**2. Permissões negadas:**
```
[NotificationService] Permissão concedida: false
```
**Solução**: Vá em Configurações > Apps > TakePips > Notificações e ative.

**3. Erro de rede:**
```
[NotificationService] ❌ Requisição feita mas sem resposta do servidor
```
**Solução**: Verifique conexão de internet.

**4. Nenhum log aparece:**
- O app pode não estar executando o código
- Verifique se o APK foi gerado com as últimas mudanças
- Tente limpar e reinstalar o app

## 📤 Compartilhar Logs

1. Copie os logs relevantes (tudo que começa com `[usePushNotifications]` ou `[NotificationService]`)
2. Cole aqui para análise

## 🚀 Comando Rápido Completo

```bash
# Limpar logs
adb logcat -c

# Ver logs filtrados (em tempo real)
adb logcat | grep -E "\[usePushNotifications\]|\[NotificationService\]|\[RootLayout\]|ExpoPushToken|POST.*push"
```

## 💡 Dica

Se não conseguir ver os logs, tente:

```bash
# Ver todos os logs do React Native
adb logcat *:S ReactNative:V ReactNativeJS:V

# Ou ver todos os logs e procurar manualmente
adb logcat > all_logs.txt
# Depois abra all_logs.txt e procure por "usePushNotifications" ou "NotificationService"
```

