# 📱 Como Ver Logs do App com Android Studio

## ✅ Vantagens do Android Studio

- ✅ ADB já vem instalado
- ✅ Interface visual para ver logs
- ✅ Filtros fáceis de usar
- ✅ Não precisa de linha de comando

---

## 📥 Passo 1: Instalar Android Studio

1. Baixe: https://developer.android.com/studio
2. Instale normalmente (pode demorar alguns minutos)
3. Na primeira execução, ele vai baixar componentes adicionais

---

## 🔌 Passo 2: Conectar Dispositivo

1. **Conecte o dispositivo Android via USB**
2. **Ative USB Debugging no dispositivo:**
   - Vá em **Configurações** > **Sobre o telefone**
   - Toque 7 vezes em **Número da versão** (para ativar Modo Desenvolvedor)
   - Volte para **Configurações** > **Opções do desenvolvedor**
   - Ative **Depuração USB**
3. **Aceite a autorização** quando aparecer no dispositivo

---

## 📊 Passo 3: Ver Logs no Android Studio

### Método 1: Logcat (Recomendado)

1. **Abra o Android Studio**
2. **Conecte o dispositivo** (deve aparecer na barra superior)
3. **Abra a aba Logcat:**
   - Vá em **View** > **Tool Windows** > **Logcat**
   - Ou clique no ícone **Logcat** na barra inferior
4. **Filtre os logs:**
   - No campo de busca, digite: `RootLayout|usePushNotifications|NotificationService`
   - Ou use o filtro: `package:com.takepips.mobile`

### Método 2: Terminal Integrado

1. **Abra o Terminal no Android Studio:**
   - Vá em **View** > **Tool Windows** > **Terminal**
   - Ou use `Alt + F12`
2. **Execute os comandos:**
   ```bash
   adb devices
   adb logcat -c
   adb logcat | grep -E "\[RootLayout\]|\[usePushNotifications\]|\[NotificationService\]"
   ```

---

## 🔍 O Que Procurar nos Logs

### ✅ Logs de Sucesso Esperados:

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

### ❌ Problemas Comuns:

**1. App detectado como Expo Go:**
```
[NotificationService] Constants.appOwnership: expo
[NotificationService] ⚠️ Expo Go detectado
```
**Solução**: Certifique-se de que o APK foi gerado com `eas build`, não rodado no Expo Go.

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

---

## 🎯 Passo 4: Testar o App

1. **Instale o APK no dispositivo** (se ainda não instalou)
2. **Abra o app TakePips**
3. **Observe os logs aparecerem no Logcat**
4. **Copie os logs relevantes**

---

## 📋 Filtros Úteis no Logcat

### Filtrar por Tag:
```
tag:RootLayout
tag:usePushNotifications
tag:NotificationService
```

### Filtrar por Package:
```
package:com.takepips.mobile
```

### Filtrar por Nível:
```
level:info
level:error
```

### Combinar Filtros:
```
package:com.takepips.mobile level:info tag:NotificationService
```

---

## 💡 Dicas

1. **Salvar Logs:**
   - Clique com botão direito no Logcat
   - Selecione **Save Logcat to File**
   - Salve para compartilhar depois

2. **Limpar Logs:**
   - Clique no ícone de **lixeira** no Logcat
   - Ou use `Ctrl + L`

3. **Pesquisar nos Logs:**
   - Use `Ctrl + F` para buscar texto específico

4. **Ver Apenas Erros:**
   - Filtre por `level:error`

---

## 🚀 Depois de Ver os Logs

1. **Copie os logs relevantes** (tudo que começa com `[RootLayout]`, `[usePushNotifications]`, `[NotificationService]`)
2. **Verifique os logs do backend** na Vercel (se houver requisição)
3. **Compartilhe os logs** para diagnóstico

---

## ❓ Problemas Comuns

### Dispositivo não aparece
- Verifique se USB Debugging está ativado
- Tente desconectar e reconectar o cabo
- Aceite a autorização no dispositivo

### Logs não aparecem
- Certifique-se de que o app está rodando
- Verifique se o filtro está correto
- Tente limpar os logs e abrir o app novamente

### ADB ainda não funciona
- Feche e reabra o Android Studio
- Verifique se o Android Studio terminou de instalar todos os componentes
- Tente usar o caminho completo: `C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools\adb.exe`

---

## 📤 Próximos Passos

Após instalar o Android Studio e ver os logs:

1. ✅ **Instalar Android Studio**
2. ✅ **Conectar dispositivo**
3. ✅ **Abrir Logcat**
4. ✅ **Abrir o app TakePips**
5. ✅ **Copiar logs relevantes**
6. ✅ **Compartilhar para diagnóstico**

Boa sorte! 🚀

