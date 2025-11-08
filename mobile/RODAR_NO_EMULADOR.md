# 📱 Como Rodar o App no Emulador Android

## ⚠️ IMPORTANTE: Push Notifications NÃO Funcionam em Emuladores!

O código do app **bloqueia push notifications em emuladores** por design. Para testar push notifications, você **precisa usar um dispositivo físico**.

No entanto, você pode rodar o app no emulador para testar **outras funcionalidades** do app.

---

## 🚀 Passo a Passo

### 1. Certificar-se que o Emulador Está Rodando

- O emulador deve estar **aberto e funcionando**
- Você deve ver a tela do Android no emulador

### 2. Navegar até a Pasta do Projeto

```powershell
cd C:\Projetos\takepips\mobile
```

### 3. Iniciar o Expo

```powershell
npm start
```

Ou:

```powershell
npx expo start
```

### 4. Abrir no Emulador

Quando o Expo iniciar, você verá um menu. Pressione:

```
a
```

(Pressione a tecla `a` para abrir no Android Emulator)

Ou você pode executar diretamente:

```powershell
npm run android
```

---

## 📊 O Que Você Verá

### No Terminal:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor
```

### No Emulador:

- O app TakePips será instalado e aberto automaticamente
- Você verá a splash screen
- Depois a tela de login ou home (se já estiver logado)

---

## 🔍 Ver Logs no Emulador

### Opção 1: Logcat no Android Studio

1. **Abra o Android Studio**
2. **Vá em View > Tool Windows > Logcat**
3. **Selecione o emulador** no dropdown (se não aparecer automaticamente)
4. **Filtre por:**
   ```
   RootLayout|usePushNotifications|NotificationService
   ```

### Opção 2: Terminal Integrado

No terminal do Android Studio ou PowerShell:

```powershell
# Listar dispositivos (deve mostrar o emulador)
adb devices

# Ver logs
adb logcat | Select-String -Pattern "RootLayout|usePushNotifications|NotificationService"
```

---

## ⚠️ O Que NÃO Funcionará no Emulador

### ❌ Push Notifications

O código bloqueia push notifications em emuladores:

```typescript
if (!Device.isDevice) {
  console.log('[NotificationService] ⚠️ Simulador/emulador detectado - push notifications desabilitadas');
  return null;
}
```

**Você verá nos logs:**
```
[NotificationService] ⚠️ Simulador/emulador detectado - push notifications desabilitadas
[usePushNotifications] ❌ Não foi possível obter token
```

### ✅ O Que Funcionará

- ✅ Todas as telas do app
- ✅ Navegação
- ✅ Autenticação
- ✅ Listagem de sinais
- ✅ Vídeos do YouTube
- ✅ Calculadoras
- ✅ E-books
- ✅ Todas as outras funcionalidades

---

## 🎯 Para Testar Push Notifications

Você **precisa usar um dispositivo físico**:

1. **Conecte um dispositivo Android via USB**
2. **Ative Depuração USB** no dispositivo
3. **Execute:**
   ```powershell
   npm start
   ```
4. **Escaneie o QR code** com o Expo Go (se estiver usando Expo Go)
5. **Ou instale o APK** gerado com `eas build`

---

## 🔧 Comandos Úteis

### Recarregar o App

No terminal do Expo, pressione:
```
r
```

### Limpar Cache e Reiniciar

```powershell
npx expo start --clear
```

### Ver Logs do Emulador

```powershell
adb logcat
```

### Parar o Servidor

No terminal do Expo, pressione:
```
Ctrl + C
```

---

## 📋 Checklist

- [ ] Emulador Android está rodando
- [ ] Navegou até `mobile/`
- [ ] Executou `npm start` ou `npx expo start`
- [ ] Pressionou `a` para abrir no emulador
- [ ] App abriu no emulador
- [ ] Logcat está mostrando logs (se quiser ver)

---

## 💡 Dicas

1. **Primeira vez pode demorar**: O Expo precisa baixar dependências e compilar
2. **Mantenha o terminal aberto**: O Metro bundler precisa estar rodando
3. **Use `r` para recarregar**: Após fazer mudanças no código
4. **Use `m` para abrir menu**: Ver opções do Expo Dev Tools

---

## ❓ Problemas Comuns

### Emulador não aparece

```powershell
# Verificar se o emulador está rodando
adb devices
```

Se não aparecer, certifique-se de que o emulador está realmente aberto.

### App não abre no emulador

- Verifique se o emulador está rodando
- Tente fechar e reabrir o emulador
- Execute `adb devices` para verificar conexão

### Erro de conexão

- Verifique se o firewall não está bloqueando
- Tente usar `npm start --tunnel` (mais lento, mas mais confiável)

---

## 🚀 Próximos Passos

Após rodar no emulador:

1. ✅ **Teste outras funcionalidades** do app
2. ✅ **Veja os logs** no Logcat (mesmo que push não funcione)
3. ✅ **Para testar push notifications**, use um **dispositivo físico**

Boa sorte! 🎉

