# 🚀 Gerar Build Após Configurar Firebase

## ✅ Status Atual

**Firebase FCM V1 configurado com sucesso!** ✅

Agora você precisa gerar um novo build do APK para incluir essas credenciais.

---

## 📋 Próximo Passo: Gerar Build

### Execute no Terminal:

```powershell
cd C:\Projetos\takepips\mobile
eas build -p android --profile preview
```

---

## ⏱️ O Que Acontece

1. **EAS vai:**
   - ✅ Usar as credenciais Firebase que você acabou de configurar
   - ✅ Compilar o app Android
   - ✅ Gerar um APK com Firebase configurado
   - ⏳ Demorar cerca de **10-15 minutos**

2. **Você verá:**
   - Progresso do build no terminal
   - Link para baixar o APK quando concluir

---

## 📥 Após o Build Completar

### 1. Baixar APK

- O EAS vai fornecer um link para download
- Baixe o arquivo `.apk`

### 2. Instalar no Dispositivo

1. **Transfira o APK** para o celular (via USB, email, ou download direto)
2. **Desinstale o app antigo** (se necessário)
3. **Instale o novo APK**
4. **Permita instalação de fontes desconhecidas** (se pedir)

### 3. Testar

1. **Abra o app** no celular
2. **Veja os logs** no Android Studio Logcat (filtro: `ReactNativeJS`)

---

## ✅ Logs Esperados (Sucesso)

Com o novo APK, você deve ver:

```
[RootLayout] ✅ RootLayoutContent renderizado
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] Token (primeiros 50 chars): ExponentPushToken[...]
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] ✅ Resposta recebida do backend!
[NotificationService] ✅ Device registered successfully
```

**E NÃO deve aparecer:**
```
❌ Default FirebaseApp is not initialized
```

---

## 🔍 Verificar se Funcionou

### 1. Verificar Logs do App

- Abra Android Studio Logcat
- Filtro: `ReactNativeJS`
- Procure por: `✅ Push token obtido com sucesso`

### 2. Verificar Backend

- Crie um sinal no backend
- Verifique os logs do backend
- Deve aparecer: `[PUSH] Tokens Expo encontrados: 1` (ou mais)

### 3. Verificar Banco de Dados

Execute no Supabase:
```sql
SELECT * FROM expo_push_tokens ORDER BY created_at DESC;
```

Deve retornar pelo menos 1 registro com o token do seu dispositivo.

### 4. Testar Notificação

- Crie um novo sinal no backend
- A notificação deve chegar no celular! 📱

---

## 📋 Checklist Completo

- [x] ✅ Credenciais Firebase FCM V1 configuradas
- [ ] ⏳ Gerar novo build (`eas build -p android --profile preview`)
- [ ] ⏳ Aguardar build completar (10-15 minutos)
- [ ] ⏳ Baixar APK do link fornecido
- [ ] ⏳ Instalar APK no dispositivo
- [ ] ⏳ Abrir app e verificar logs
- [ ] ⏳ Verificar se token foi obtido com sucesso
- [ ] ⏳ Verificar se token foi registrado no backend
- [ ] ⏳ Verificar se token aparece no banco de dados
- [ ] ⏳ Testar notificação criando um sinal

---

## 🎯 Comando Completo

```powershell
# 1. Ir para o diretório
cd C:\Projetos\takepips\mobile

# 2. Gerar build
eas build -p android --profile preview

# 3. Aguardar conclusão (10-15 minutos)

# 4. Baixar e instalar APK

# 5. Testar!
```

---

## 💡 Dica

Enquanto o build está rodando, você pode:
- Preparar o dispositivo para instalação
- Abrir o Android Studio Logcat
- Verificar se o backend está rodando

---

Boa sorte! 🚀

Depois que o build completar e você instalar o APK, as notificações devem funcionar! 🎉

