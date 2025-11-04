# 🎨 Assets do TakePips Mobile

Esta pasta contém os assets (imagens, ícones) do aplicativo mobile React Native/Expo.

## ✅ Arquivos Gerados

Todos os assets necessários foram gerados automaticamente com o **tema GOLD**:

1. ✅ **icon.png** (1024×1024px, 39 KB) - Ícone principal do app
2. ✅ **splash.png** (1284×2778px, 20 KB) - Tela de splash/abertura
3. ✅ **adaptive-icon.png** (1024×1024px, 39 KB) - Ícone adaptativo para Android
4. ✅ **favicon.png** (48×48px, 2 KB) - Favicon para web

## 🎨 Design

Todos os assets usam o mesmo design do PWA web:
- **Tema**: GOLD/Forex profissional
- **Elementos**: Candlesticks dourados + símbolo AU (Gold)
- **Cores**: Gradientes dourados (#FFD700, #FDB931, #DAA520)
- **Background**: Dark theme (#0A0E27, #0a0e1a)

## 🔄 Regenerar Assets

Para regenerar todos os assets do mobile:

```bash
# Na raiz do projeto (não no diretório mobile)
node scripts/generate-mobile-assets.js

# Ou usando npm
npm run generate:mobile
```

## 📱 Uso no Expo

Os assets estão configurados em `mobile/app.json`:
- **icon**: Usado no iOS e Android
- **adaptive-icon**: Específico para Android (Material Design)
- **splash**: Tela de carregamento inicial
- **favicon**: Para versão web do Expo

## ✏️ Personalizar Design

Para modificar o design dos assets:

1. Edite o arquivo SVG fonte: `public/icon.svg`
2. Execute o script de geração: `node scripts/generate-mobile-assets.js`
3. Os PNGs serão regenerados automaticamente

## 📐 Especificações

- **icon.png**: 1024×1024px, PNG com background
- **adaptive-icon.png**: 1024×1024px, PNG com background (Android Oreo+)
- **splash.png**: 1284×2778px, PNG otimizado (iPhone 14 Pro Max)
- **favicon.png**: 48×48px, PNG para web

---

**Última atualização**: 2025-11-03
**Tema**: GOLD Trading Signals
**Gerado automaticamente**: scripts/generate-mobile-assets.js
