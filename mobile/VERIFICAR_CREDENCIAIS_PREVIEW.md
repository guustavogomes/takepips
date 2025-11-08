# Verificar Credenciais para o Perfil Preview

## ⚠️ Problema
O erro "Default FirebaseApp is not initialized" ainda aparece porque:
- As credenciais foram configuradas para o perfil `development`
- Mas o build foi gerado com o perfil `preview`
- **Cada perfil precisa ter suas próprias credenciais configuradas**

## ✅ Solução

### Passo 1: Verificar credenciais do perfil preview
Execute:
```powershell
cd C:\Projetos\takepips\mobile
eas credentials
```

Quando perguntar:
1. **Select platform** → `Android`
2. **Which build profile?** → `preview` (NÃO `development`)
3. **What do you want to do?** → `Push Notifications (FCM V1): Set up a Google Service Account Key`
4. Forneça o mesmo arquivo JSON que você usou antes:
   ```
   C:\Users\gusta\Downloads\taketips-1e317-firebase-adminsdk-fbsvc-388e182201.json
   ```

### Passo 2: Gerar novo build
Depois de configurar as credenciais para `preview`, gere um novo build:
```powershell
eas build -p android --profile preview
```

## 🔍 Como verificar se está configurado
Quando executar `eas credentials` e selecionar `preview`, você deve ver:
```
Push Notifications (FCM V1): Google Service Account Key For FCM V1
✅ Assigned (não "None assigned yet")
```

Se aparecer "None assigned yet", você precisa configurar!

