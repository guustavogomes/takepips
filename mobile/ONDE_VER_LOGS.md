# 📱 Onde Ver os Logs do App Android

## 🎯 Resumo Rápido

Os logs do app aparecem em **2 lugares diferentes**:

1. **Logs do App** (no terminal do computador via `adb logcat`)
2. **Logs do Backend** (no dashboard da Vercel)

---

## 📱 1. Logs do App (Android)

### Onde Aparecem
**No terminal do seu computador** quando você executa `adb logcat`

### Como Ver

#### Passo 1: Conectar Dispositivo

```bash
# Conectar dispositivo Android via USB
adb devices
```

**Saída esperada:**
```
List of devices attached
ABC123XYZ    device
```

Se aparecer "unauthorized", **aceite a autorização no dispositivo**.

#### Passo 2: Ver Logs em Tempo Real

```bash
# Limpar logs antigos
adb logcat -c

# Ver logs filtrados (apenas do TakePips)
adb logcat | grep -E "\[RootLayout\]|\[usePushNotifications\]|\[NotificationService\]"
```

### O Que Você Vai Ver

Quando abrir o app, você verá logs como:

```
[RootLayout] ✅ RootLayoutContent renderizado
[RootLayout] Hook usePushNotifications será chamado agora...
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
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] API URL: https://takepips.vercel.app
[NotificationService] Fazendo requisição POST...
[NotificationService] ✅ Resposta recebida do backend!
```

### ⚠️ Importante

- Os logs aparecem **em tempo real** no terminal
- Você precisa deixar o terminal aberto enquanto usa o app
- Pressione `Ctrl+C` para parar de ver os logs

---

## 🌐 2. Logs do Backend (Vercel)

### Onde Aparecem
**No dashboard da Vercel** → Deployments → Function Logs

### Como Ver

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **takepips**
3. Vá em **Deployments** → Último deploy
4. Clique em **Functions** → **View Function Logs**

### O Que Você Vai Ver

Quando o app fizer a requisição, você verá:

```
[API] POST /api/push/subscribe - 2025-11-07T...
[API] Body recebido: {...}
[API] ✅ Expo Push Token salvo com sucesso
[API] Token: ExponentPushToken[...]
[API] Platform: android
[API] Device ID: ...
```

### ⚠️ Importante

- Os logs do backend aparecem **apenas quando há requisições**
- Se não aparecer `[API] POST /api/push/subscribe`, significa que o app não está fazendo a requisição

---

## 🔍 3. Alternativa: React Native Debugger

Se você estiver usando React Native Debugger:

1. Abra o React Native Debugger
2. Conecte o dispositivo ao computador
3. Abra o app no dispositivo
4. Os logs aparecem no **console do React Native Debugger**

---

## 📋 Checklist Completo

### Para Ver Logs do App:

- [ ] Dispositivo Android conectado via USB
- [ ] USB Debugging ativado no dispositivo
- [ ] ADB instalado no computador
- [ ] Terminal aberto com `adb logcat` rodando
- [ ] App aberto no dispositivo

### Para Ver Logs do Backend:

- [ ] Acessar dashboard da Vercel
- [ ] Selecionar projeto takepips
- [ ] Ir em Deployments → Function Logs
- [ ] Procurar por `[API] POST /api/push/subscribe`

---

## 🚀 Comando Rápido Completo

```bash
# 1. Verificar se dispositivo está conectado
adb devices

# 2. Limpar logs antigos
adb logcat -c

# 3. Ver logs filtrados (deixe rodando)
adb logcat | grep -E "\[RootLayout\]|\[usePushNotifications\]|\[NotificationService\]|POST.*push"
```

**Depois:**
- Abra o app no dispositivo
- Observe os logs aparecerem no terminal
- Copie os logs relevantes

---

## 💡 Dica

Se você não conseguir ver os logs com `adb logcat`, tente:

```bash
# Ver todos os logs (sem filtro)
adb logcat > logs_completos.txt

# Depois abra o arquivo logs_completos.txt e procure por:
# - [RootLayout]
# - [usePushNotifications]
# - [NotificationService]
```

---

## ❓ Problemas Comuns

### "adb: command not found"
**Solução**: Instale o Android SDK Platform Tools ou use o caminho completo do adb.

### "no devices/emulators found"
**Solução**: 
- Verifique se o cabo USB está conectado
- Ative USB Debugging no dispositivo
- Aceite a autorização no dispositivo

### Nenhum log aparece
**Solução**: 
- Certifique-se de que o APK foi gerado **depois** das mudanças de logs
- Tente limpar e reinstalar o app
- Verifique se o app está realmente rodando

---

## 📤 Compartilhar Logs

Após capturar os logs, compartilhe:

1. **Logs do app** (do terminal `adb logcat`)
2. **Logs do backend** (da Vercel, se houver requisição)
3. **Resultado da query** no banco: `SELECT * FROM expo_push_tokens;`

Com esses logs, poderemos identificar exatamente onde está o problema!

