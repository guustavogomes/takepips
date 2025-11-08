# 📱 Usar Android Studio para Ver Logs (Sem Projeto)

## ✅ Você NÃO Precisa Criar/Abrir Projeto!

O Android Studio pode mostrar os logs do dispositivo **sem precisar abrir um projeto**.

---

## 🚀 Passo a Passo Rápido

### 1. Fechar a Tela Inicial (Opcional)

- Você pode simplesmente **fechar** a tela de "New Project" clicando em **Cancel** ou **X**
- Ou pode clicar em **Open** e abrir qualquer pasta (não precisa ser um projeto Android)

### 2. Conectar Dispositivo

1. **Conecte seu dispositivo Android via USB**
2. **Ative Depuração USB** no dispositivo (se ainda não ativou):
   - Configurações > Sobre o telefone > Toque 7 vezes em "Número da versão"
   - Configurações > Opções do desenvolvedor > Ative "Depuração USB"
3. **Aceite a autorização** quando aparecer no dispositivo

### 3. Abrir Logcat

1. **No Android Studio, vá em:**
   - **View** > **Tool Windows** > **Logcat**
   - Ou clique no ícone **Logcat** na barra inferior (se estiver visível)

2. **Se não aparecer o Logcat:**
   - Vá em **View** > **Tool Windows** > **Logcat**
   - Ou use o atalho: `Alt + 6` (no Windows)

### 4. Verificar Dispositivo Conectado

- No topo do Logcat, você deve ver seu dispositivo listado
- Se não aparecer, verifique se o cabo USB está conectado e se a depuração USB está ativa

### 5. Filtrar Logs

No campo de busca do Logcat, digite:

```
RootLayout|usePushNotifications|NotificationService
```

Ou use o filtro de package:

```
package:com.takepips.mobile
```

### 6. Abrir o App

1. **Abra o app TakePips no dispositivo**
2. **Observe os logs aparecerem no Logcat**
3. **Copie os logs relevantes**

---

## 📋 Alternativa: Usar Terminal Integrado

Se preferir usar linha de comando:

1. **No Android Studio, vá em:**
   - **View** > **Tool Windows** > **Terminal**
   - Ou use `Alt + F12`

2. **Execute:**
   ```bash
   adb devices
   ```
   Deve mostrar seu dispositivo.

3. **Execute:**
   ```bash
   adb logcat -c
   adb logcat | findstr "RootLayout usePushNotifications NotificationService"
   ```

---

## 🎯 O Que Você Vai Ver

Quando abrir o app, você verá logs como:

```
[RootLayout] ✅ RootLayoutContent renderizado
[RootLayout] Hook usePushNotifications será chamado agora...
[usePushNotifications] ========================================
[usePushNotifications] 🚀 Iniciando registro de push notifications...
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] 📤 Registrando dispositivo no backend...
```

---

## 💡 Dicas

1. **Limpar Logs:**
   - Clique no ícone de **lixeira** no Logcat
   - Ou use `Ctrl + L`

2. **Salvar Logs:**
   - Clique com botão direito no Logcat
   - Selecione **Save Logcat to File**

3. **Pesquisar:**
   - Use `Ctrl + F` para buscar texto específico

---

## ❓ Problemas Comuns

### Logcat não aparece
- Vá em **View** > **Tool Windows** > **Logcat**
- Ou use `Alt + 6`

### Dispositivo não aparece
- Verifique se USB Debugging está ativado
- Tente desconectar e reconectar o cabo
- Aceite a autorização no dispositivo

### Nenhum log aparece
- Certifique-se de que o app está rodando
- Verifique se o filtro está correto
- Tente limpar os logs e abrir o app novamente

---

## 🚀 Próximos Passos

1. ✅ Conectar dispositivo
2. ✅ Abrir Logcat no Android Studio
3. ✅ Filtrar por `RootLayout|usePushNotifications|NotificationService`
4. ✅ Abrir o app TakePips
5. ✅ Copiar logs relevantes
6. ✅ Compartilhar para diagnóstico

Boa sorte! 🚀

