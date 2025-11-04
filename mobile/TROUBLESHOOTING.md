# 🔧 Troubleshooting - TakePips Mobile

## 🐛 Problemas Comuns e Soluções

### 0. ⚠️ ERROR expo-notifications (Expo Go)

**Erro completo**:
```
ERROR expo-notifications: Android Push notifications (remote notifications)
functionality provided by expo-notifications was removed from Expo Go
with the release of SDK 53.
```

**Status**: ✅ **PODE IGNORAR** - Não impede o app de funcionar!

**Explicação**: Este erro aparece no Expo Go porque push notifications remotas foram removidas do SDK 53+. Mas 99% do app funciona normalmente, incluindo notificações locais!

**Solução**:
- **Para desenvolvimento**: IGNORE o erro, continue codando
- **Para produção**: Use EAS Build ou Development Build
- **Leia mais**: `mobile/EXPO_GO_NOTIFICATIONS.md`

---

### 1. ❌ "Unable to resolve [package]"

**Causa**: Dependência não instalada ou cache desatualizado

**Solução**:
```bash
# Instale a dependência faltante
cd mobile
npm install [nome-do-pacote]

# Limpe o cache e reinicie
npx expo start --clear
```

---

### 2. 🔄 Mudanças não aparecem no app

**Causa**: Cache do Metro bundler

**Solução**:
```bash
# Pare o servidor (Ctrl+C)
npx expo start --clear

# Ou force reload no app:
# Android: Pressione 'r' no terminal ou shake + Reload
# iOS: Cmd+R ou shake + Reload
```

---

### 3. 📺 Vídeos do YouTube não carregam

**Causa**: Falta `react-native-webview` ou ID de vídeo inválido

**Solução**:
```bash
# Instale a dependência
npm install react-native-webview

# Verifique os IDs dos vídeos
# Devem ser apenas o ID, não a URL completa
# Correto: 'dQw4w9WgXcQ'
# Errado: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
```

---

### 4. 🎨 Ícones não aparecem

**Causa**: `@expo/vector-icons` não carregado

**Solução**:
```bash
# Aguarde o bundler terminar completamente
# Verifique no console se há erros

# Se persistir:
npx expo install @expo/vector-icons
npx expo start --clear
```

---

### 5. 📱 App não abre no dispositivo

**Causa**: Firewall, porta ocupada ou problema de conexão

**Solução**:
```bash
# Verifique se está na mesma rede Wi-Fi
# Tente mudar o modo de conexão:
npx expo start --tunnel

# Ou especifique a porta:
npx expo start --port 8081
```

---

### 6. 🔴 Erro de build/compilação

**Causa**: Node modules corrompidos ou versão incompatível

**Solução**:
```bash
# Limpe tudo e reinstale
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

---

### 7. ⚠️ Warnings do Metro (EBADENGINE)

**Causa**: Versão do Node.js levemente diferente da requerida

**Status**: ✅ **PODE IGNORAR**

Estes warnings são informativos. O app funciona normalmente com Node 20.19.1 mesmo que alguns pacotes peçam 20.19.4.

---

### 8. 🌐 Problema com react-native-webview no iOS

**Causa**: Permissões não configuradas

**Solução**:

Se estiver usando bare workflow, adicione ao Info.plist:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

Para Expo Go, não precisa fazer nada.

---

### 9. 💾 Dados não persistem entre reloads

**Causa**: Usando state local sem persistence

**Solução**:
```bash
# Instale AsyncStorage
npx expo install @react-native-async-storage/async-storage

# Use em vez de useState para dados persistentes
```

---

### 10. 🚫 Tabs não aparecem

**Causa**: Erro em algum arquivo de tab ou _layout.tsx

**Solução**:
```bash
# Verifique o console para erros
# Certifique-se que todos os arquivos existem:
ls app/(tabs)/

# Devem existir:
# - _layout.tsx
# - home.tsx
# - education.tsx
# - index.tsx
# - tools.tsx
# - profile.tsx
```

---

## 🆘 Comandos Úteis

```bash
# Iniciar com cache limpo
npx expo start --clear

# Iniciar em modo tunnel (funciona em qualquer rede)
npx expo start --tunnel

# Ver logs mais detalhados
npx expo start --dev-client

# Checar problemas de dependências
npm doctor

# Ver versão do Expo
npx expo --version

# Atualizar Expo CLI
npm install -g expo-cli@latest
```

---

## 📊 Verificar Status do Projeto

```bash
# Verificar instalação
cd mobile
npm list react-native-youtube-iframe
npm list react-native-webview
npm list @expo/vector-icons

# Verificar estrutura de arquivos
ls -la app/(tabs)/

# Verificar package.json
cat package.json | grep dependencies -A 20
```

---

## 🔄 Resetar Completamente

Se nada funcionar, tente um reset completo:

```bash
cd mobile

# 1. Limpar tudo
rm -rf node_modules
rm -rf .expo
rm package-lock.json

# 2. Reinstalar
npm install

# 3. Reiniciar limpo
npx expo start --clear
```

---

## 📞 Ainda com problemas?

1. **Verifique os logs**: Leia as mensagens de erro com atenção
2. **Console do Chrome**: Abra dev tools no Expo Go (shake + Debug)
3. **Documentação**: https://docs.expo.dev/
4. **GitHub Issues**: Reporte bugs no repositório

---

**Última atualização**: 2025-11-03
**Versão**: 1.0.0
