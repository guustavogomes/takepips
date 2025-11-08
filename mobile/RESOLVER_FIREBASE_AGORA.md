# 🔥 Resolver Erro do Firebase AGORA

## 🎯 Problema Identificado

Os logs mostram:
```
❌ Default FirebaseApp is not initialized in this process com.takepips.mobile
```

**Causa:** As credenciais do Firebase Cloud Messaging (FCM) não estão configuradas no build do APK.

---

## ✅ Solução Rápida (5 minutos)

### Passo 1: Configurar Credenciais FCM

```powershell
cd C:\Projetos\takepips\mobile
eas credentials
```

**Selecione:**
1. **Android**
2. **Push Notifications (FCM)**
3. **Set up new credentials** (ou **Update existing credentials**)

**Opções disponíveis:**

#### Opção A: FCM V1 (Recomendado - Mais Fácil)
- Escolha: **FCM V1: Google Service Account Key**
- Escolha: **Set up new credentials**
- O EAS vai criar automaticamente um projeto Firebase e configurar tudo!

#### Opção B: FCM Legacy (Manual)
- Escolha: **FCM Legacy: Server Key**
- Você precisará:
  1. Acessar https://console.firebase.google.com/
  2. Criar/adicionar app Android
  3. Obter a Server Key
  4. Colar no EAS

**💡 Recomendação:** Use **FCM V1** - é mais fácil e automático!

---

### Passo 2: Gerar Novo Build

Após configurar as credenciais:

```powershell
eas build -p android --profile preview
```

**⏱️ Tempo:** 10-15 minutos

---

### Passo 3: Instalar Novo APK

1. **Aguarde o build completar**
2. **Baixe o APK** do link fornecido
3. **Desinstale o app antigo** (se necessário)
4. **Instale o novo APK**

---

### Passo 4: Verificar se Funcionou

1. **Abra o app** no celular
2. **Veja os logs** no Logcat (filtro: `ReactNativeJS`)
3. **Deve aparecer:**
   ```
   [NotificationService] ✅ Push token obtido com sucesso
   [NotificationService] Token (primeiros 50 chars): ExponentPushToken[...]
   [NotificationService] 📤 Registrando dispositivo no backend...
   [NotificationService] ✅ Resposta recebida do backend!
   ```

**E NÃO deve aparecer:**
```
❌ Default FirebaseApp is not initialized
```

---

## 🚀 Comandos Completos

```powershell
# 1. Ir para o diretório
cd C:\Projetos\takepips\mobile

# 2. Configurar credenciais FCM
eas credentials
# Escolha: Android > Push Notifications (FCM V1) > Set up new credentials

# 3. Gerar novo build
eas build -p android --profile preview

# 4. Aguardar conclusão (10-15 minutos)

# 5. Baixar e instalar APK no celular

# 6. Verificar logs no Android Studio Logcat
```

---

## 📋 Checklist

- [ ] Executar `eas credentials`
- [ ] Escolher FCM V1 (recomendado) ou FCM Legacy
- [ ] Configurar credenciais com sucesso
- [ ] Gerar novo build (`eas build -p android --profile preview`)
- [ ] Aguardar build completar (10-15 minutos)
- [ ] Instalar novo APK no dispositivo
- [ ] Verificar logs - deve aparecer token obtido com sucesso
- [ ] Verificar backend - deve receber requisição `/api/push/subscribe`
- [ ] Verificar banco de dados - token deve aparecer na tabela `expo_push_tokens`

---

## ❓ Se Tiver Dúvidas Durante `eas credentials`

### Se pedir FCM API Key (Legacy):
1. Acesse: https://console.firebase.google.com/
2. Crie/adicione projeto
3. Adicione app Android (`com.takepips.mobile`)
4. Vá em **Configurações do projeto** > **Cloud Messaging**
5. Copie a **Server Key**
6. Cole no terminal do EAS

### Se preferir FCM V1 (mais fácil):
1. Escolha **FCM V1: Google Service Account Key**
2. Escolha **Set up new credentials**
3. O EAS faz tudo automaticamente!

---

## 🎯 Próximos Passos Após Configurar

1. ✅ **Gerar build** com Firebase configurado
2. ✅ **Instalar APK** no dispositivo
3. ✅ **Verificar logs** - token deve ser obtido
4. ✅ **Testar notificações** - criar um sinal no backend
5. ✅ **Verificar se notificação chega** no celular

---

Boa sorte! 🚀

