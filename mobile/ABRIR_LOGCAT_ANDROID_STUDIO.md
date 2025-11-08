# 📱 Como Abrir Logcat no Android Studio

## 🎯 Você Está Aqui

Você instalou o APK no celular e precisa ver os logs, mas não encontra o Logcat no Android Studio.

---

## 🚀 Método 1: Via Menu (Mais Fácil)

### Passo a Passo:

1. **Abra o Android Studio**
2. **Conecte o celular via USB** ao computador
3. **Ative Depuração USB** no celular (se ainda não ativou)
4. **No Android Studio, vá em:**
   ```
   View → Tool Windows → Logcat
   ```
   Ou use o atalho: **Alt + 6** (Windows)

5. **O Logcat deve aparecer na parte inferior** do Android Studio

---

## 🚀 Método 2: Via Barra Inferior

1. **Olhe na parte inferior** do Android Studio
2. **Procure por abas** como: `Logcat`, `Terminal`, `Build`, etc.
3. **Clique na aba "Logcat"**

Se não aparecer:
- Vá em **View → Tool Windows → Logcat**

---

## 🚀 Método 3: Se Não Aparecer Nenhuma Opção

### Verificar se o Dispositivo Está Conectado:

1. **No Android Studio, olhe no canto superior direito**
2. **Deve aparecer seu dispositivo** na lista de dispositivos
3. **Se não aparecer:**
   - Verifique se o cabo USB está conectado
   - Ative Depuração USB no celular
   - Aceite a autorização no celular quando aparecer

### Abrir Logcat Forçadamente:

1. **Vá em: View → Tool Windows → Logcat**
2. **Ou use o atalho: Alt + 6**
3. **O Logcat deve aparecer na parte inferior**

---

## 🔍 Configurar o Logcat

Após abrir o Logcat:

1. **Selecione seu dispositivo** no dropdown (canto superior esquerdo do Logcat)
2. **No campo de busca** (filtro), digite:
   ```
   RootLayout|usePushNotifications|NotificationService
   ```
3. **Pressione Enter**

---

## 📊 O Que Você Deve Ver

Quando abrir o app no celular, você deve ver logs como:

```
[RootLayout] ✅ RootLayoutContent renderizado
[usePushNotifications] 🚀 Iniciando registro...
[NotificationService] getExpoPushToken chamado
[NotificationService] Constants.appOwnership: standalone
[NotificationService] ✅ Push token obtido com sucesso
```

---

## ❓ Problemas Comuns

### Logcat não aparece no menu

**Solução:**
1. Certifique-se de que o Android Studio está completamente aberto
2. Tente: **View → Tool Windows → Logcat**
3. Ou use o atalho: **Alt + 6**

### Dispositivo não aparece

**Solução:**
1. Verifique se o cabo USB está conectado
2. Ative Depuração USB no celular
3. Aceite a autorização quando aparecer no celular
4. Tente desconectar e reconectar o cabo

### Nenhum log aparece

**Solução:**
1. Certifique-se de que selecionou o dispositivo correto no dropdown
2. Limpe os logs: Clique no ícone de **lixeira** no Logcat
3. Abra o app no celular
4. Os logs devem aparecer em tempo real

---

## 💡 Dica: Usar Terminal Integrado

Se ainda não conseguir abrir o Logcat, use o Terminal do Android Studio:

1. **Vá em: View → Tool Windows → Terminal**
2. **Execute:**
   ```powershell
   adb devices
   ```
   Deve mostrar seu dispositivo.

3. **Execute:**
   ```powershell
   adb logcat -c
   adb logcat | Select-String -Pattern "RootLayout|usePushNotifications|NotificationService"
   ```

---

## 📋 Checklist

- [ ] Android Studio aberto
- [ ] Celular conectado via USB
- [ ] Depuração USB ativada no celular
- [ ] Autorização aceita no celular
- [ ] Logcat aberto (View → Tool Windows → Logcat)
- [ ] Dispositivo selecionado no dropdown do Logcat
- [ ] Filtro aplicado: `RootLayout|usePushNotifications|NotificationService`
- [ ] App aberto no celular
- [ ] Logs aparecendo no Logcat

---

## 🎯 Atalhos Úteis

- **Abrir Logcat**: `Alt + 6`
- **Abrir Terminal**: `Alt + F12`
- **Limpar Logs**: Clique no ícone de lixeira no Logcat
- **Pesquisar nos Logs**: `Ctrl + F`

---

Boa sorte! 🚀

