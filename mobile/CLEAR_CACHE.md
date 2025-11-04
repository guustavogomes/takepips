# 🔄 Como Limpar Cache do Expo

## Problema
Se você está vendo imagens antigas (como "the news") ou a splash screen não está atualizando, é necessário limpar o cache do Expo.

## Solução

### 1. Limpar Cache do Metro Bundler
```bash
cd mobile
npx expo start --clear
```

### 2. Se ainda não funcionar, limpar tudo:
```bash
cd mobile

# Limpar cache do npm
npm start -- --reset-cache

# OU limpar manualmente:
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

### 3. No iOS Simulator:
```bash
# Limpar cache do simulador
xcrun simctl erase all
```

### 4. No Android:
```bash
# Limpar cache do app
adb shell pm clear com.takepips.mobile
```

### 5. Limpar cache completo do Expo:
```bash
# Windows PowerShell
Remove-Item -Recurse -Force "$env:TEMP\expo-*"
Remove-Item -Recurse -Force "$env:USERPROFILE\.expo"

# Depois reiniciar
cd mobile
npx expo start --clear
```

## Verificar Assets
Certifique-se de que os assets estão corretos:
```bash
# Na raiz do projeto
npm run generate:mobile

# Verificar se os arquivos existem
ls mobile/assets/*.png
```

## Assets Corretos
Os assets devem conter:
- ✅ **icon.png** - Logo TakePips com candlesticks dourados
- ✅ **splash.png** - Background escuro (#0A0E27) com logo centralizado
- ✅ **adaptive-icon.png** - Ícone adaptativo Android
- ✅ **favicon.png** - Favicon para web

**NÃO deve conter "the news" em nenhum lugar!**

