# 💻 Usar Terminal do Android Studio para Ver Logs

## 🎯 Problema

O `adb` não está no PATH do Windows, mas você pode usar o **Terminal integrado do Android Studio** que já tem tudo configurado!

---

## 🚀 Solução: Terminal do Android Studio

### Passo 1: Abrir Terminal no Android Studio

1. **Abra o Android Studio**
2. **Vá em: View → Tool Windows → Terminal**
   - Ou use o atalho: **Alt + F12**
3. **O Terminal deve aparecer na parte inferior**

### Passo 2: Verificar Dispositivo

No Terminal do Android Studio, execute:

```bash
adb devices
```

**Deve mostrar:**
```
List of devices attached
ABC123XYZ    device
```

Se aparecer "unauthorized", **aceite a autorização no celular**.

### Passo 3: Ver Logs

No Terminal do Android Studio, execute:

```bash
# Limpar logs antigos
adb logcat -c

# Ver logs filtrados
adb logcat | grep -E "RootLayout|usePushNotifications|NotificationService"
```

**No PowerShell do Windows, use:**
```powershell
adb logcat | Select-String -Pattern "RootLayout|usePushNotifications|NotificationService"
```

---

## 🔧 Alternativa: Encontrar Caminho do ADB

Se preferir usar o PowerShell do Windows:

### Passo 1: Encontrar Caminho do ADB

O ADB geralmente está em:
```
C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

### Passo 2: Usar Caminho Completo

```powershell
# Verificar dispositivo
C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools\adb.exe devices

# Ver logs
C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools\adb.exe logcat -c
C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools\adb.exe logcat | Select-String -Pattern "RootLayout|usePushNotifications|NotificationService"
```

**Substitua `SeuUsuario` pelo seu nome de usuário do Windows.**

---

## 🎯 Método Mais Fácil: Logcat do Android Studio

Na verdade, o **mais fácil** é usar o Logcat visual do Android Studio:

1. **Abra o Android Studio**
2. **Vá em: View → Tool Windows → Logcat** (ou Alt + 6)
3. **Selecione seu dispositivo** no dropdown
4. **Filtre por:** `RootLayout|usePushNotifications|NotificationService`
5. **Abra o app no celular**
6. **Veja os logs aparecerem em tempo real**

---

## 📋 Checklist

- [ ] Android Studio aberto
- [ ] Celular conectado via USB
- [ ] Depuração USB ativada no celular
- [ ] Terminal do Android Studio aberto (Alt + F12)
- [ ] `adb devices` mostra o dispositivo
- [ ] Logs sendo capturados

---

## 💡 Dica

**O Terminal do Android Studio já tem o ADB configurado**, então você não precisa adicionar ao PATH. É mais fácil usar o Terminal do Android Studio do que configurar o PATH do Windows!

Boa sorte! 🚀

