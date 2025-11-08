# Configurar Production e Gerar APK

## 📋 Passo a Passo

### 1. Configurar Credenciais FCM para Production

Execute:
```powershell
cd C:\Projetos\takepips\mobile
eas credentials
```

Quando perguntar:
1. **Select platform** → `Android`
2. **Which build profile?** → `production` ⚠️ (IMPORTANTE: escolha production)
3. **What do you want to do?** → `Push Notifications (FCM V1): Set up a Google Service Account Key`
4. Forneça o arquivo JSON:
   ```
   C:\Users\gusta\Downloads\taketips-1e317-firebase-adminsdk-fbsvc-388e182201.json
   ```

### 2. Verificar se está configurado

Após configurar, você deve ver:
```
Push Notifications (FCM V1): Google Service Account Key For FCM V1
✅ Assigned
```

### 3. Gerar APK de Production

Execute:
```powershell
eas build -p android --profile production
```

## ⏱️ Tempo estimado
- Configuração: 2-3 minutos
- Build: 10-15 minutos

## 📱 Depois do build
1. Baixar o APK do link fornecido
2. Instalar no dispositivo (desinstale o app antigo primeiro)
3. Abrir o app e verificar logs no Logcat
4. Você deve ver: `[NotificationService] ✅ Push token obtido com sucesso`

## ⚠️ Importante
- Cada perfil (`development`, `preview`, `production`) precisa ter suas próprias credenciais configuradas
- O build de production é otimizado e pronto para distribuição

