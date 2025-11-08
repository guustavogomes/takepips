# 🔧 Como Instalar ADB no Windows

## 🎯 O Que É ADB?

ADB (Android Debug Bridge) é uma ferramenta de linha de comando para se comunicar com dispositivos Android.

## 📥 Opção 1: Instalar Android SDK Platform Tools (Recomendado)

### Passo 1: Baixar Platform Tools

1. Acesse: https://developer.android.com/tools/releases/platform-tools
2. Ou baixe diretamente: https://dl.google.com/android/repository/platform-tools-latest-windows.zip

### Passo 2: Extrair e Instalar

1. **Extraia o arquivo ZIP** em uma pasta (ex: `C:\Android\platform-tools`)
2. **Adicione ao PATH do Windows:**
   - Pressione `Win + R`
   - Digite: `sysdm.cpl` e pressione Enter
   - Vá na aba **Avançado**
   - Clique em **Variáveis de Ambiente**
   - Em **Variáveis do sistema**, encontre `Path` e clique em **Editar**
   - Clique em **Novo** e adicione: `C:\Android\platform-tools` (ou o caminho onde você extraiu)
   - Clique em **OK** em todas as janelas
   - **Reinicie o PowerShell/Terminal**

### Passo 3: Verificar Instalação

```powershell
adb version
```

**Deve mostrar:**
```
Android Debug Bridge version 1.0.41
```

---

## 📥 Opção 2: Usar Caminho Completo (Sem Instalar)

Se você não quiser instalar, pode usar o caminho completo:

```powershell
# Substitua pelo caminho onde você extraiu o platform-tools
C:\Android\platform-tools\adb.exe devices
C:\Android\platform-tools\adb.exe logcat
```

---

## 📥 Opção 3: Instalar via Chocolatey (Se Tiver)

Se você tem Chocolatey instalado:

```powershell
choco install adb
```

---

## 📥 Opção 4: Instalar Android Studio (Mais Completo)

1. Baixe o Android Studio: https://developer.android.com/studio
2. Instale normalmente
3. O ADB virá junto e será adicionado ao PATH automaticamente

---

## ✅ Verificar Se Funcionou

Após instalar, **feche e reabra o PowerShell** e execute:

```powershell
adb devices
```

**Se funcionar, você verá:**
```
List of devices attached
```

---

## 🔍 Se Ainda Não Funcionar

### Verificar Se ADB Está Instalado

```powershell
# Procurar por adb.exe no sistema
Get-ChildItem -Path C:\ -Filter adb.exe -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

### Adicionar ao PATH Manualmente

1. Encontre onde o `adb.exe` está (geralmente em `C:\Users\SeuUsuario\AppData\Local\Android\Sdk\platform-tools`)
2. Adicione esse caminho ao PATH (veja Passo 2 da Opção 1)

---

## 🚀 Depois de Instalar

Execute os comandos normalmente:

```powershell
# Verificar dispositivo conectado
adb devices

# Limpar logs
adb logcat -c

# Ver logs filtrados
adb logcat | Select-String -Pattern "\[RootLayout\]|\[usePushNotifications\]|\[NotificationService\]"
```

**Nota**: No PowerShell, use `Select-String` em vez de `grep`.

---

## 💡 Alternativa: Usar React Native Debugger

Se não conseguir instalar o ADB, você pode usar o **React Native Debugger**:

1. Instale: https://github.com/jhen0409/react-native-debugger
2. Abra o React Native Debugger
3. Conecte o dispositivo
4. Abra o app
5. Os logs aparecem no console do React Native Debugger

---

## 📋 Checklist

- [ ] ADB instalado ou caminho completo configurado
- [ ] PowerShell/Terminal reiniciado
- [ ] `adb devices` funciona
- [ ] Dispositivo conectado via USB
- [ ] USB Debugging ativado no dispositivo

---

## ❓ Ainda Com Problemas?

Se ainda não conseguir, compartilhe:
1. A mensagem de erro completa
2. Se você tem Android Studio instalado
3. Se você tem algum SDK do Android instalado

