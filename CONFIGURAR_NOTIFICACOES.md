# 📱 Configurar Web Push Notifications

## 📋 Pré-requisitos

- Node.js instalado
- Projeto deployado na Vercel
- Acesso às variáveis de ambiente da Vercel

## 🔑 Passo 1: Gerar Chaves VAPID

1. **Instalar dependências** (se ainda não instalou):
```bash
npm install
```

2. **Gerar chaves VAPID**:
```bash
node scripts/generate-vapid-keys.js
```

Você verá algo como:
```
🔑 Gerando chaves VAPID...

✅ Chaves VAPID geradas com sucesso!

📋 Adicione estas variáveis de ambiente na Vercel:

VAPID_PUBLIC_KEY=BKx...
VAPID_PRIVATE_KEY=8x...
VAPID_SUBJECT=mailto:seu-email@exemplo.com
```

## 🔧 Passo 2: Configurar na Vercel

1. Acesse o dashboard da Vercel: https://vercel.com
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `VAPID_PUBLIC_KEY` | `BKx...` (chave pública gerada) | Chave pública VAPID |
| `VAPID_PRIVATE_KEY` | `8x...` (chave privada gerada) | Chave privada VAPID |
| `VAPID_SUBJECT` | `mailto:seu-email@exemplo.com` | Email ou URL do serviço |

4. **Faça novo deploy** (ou aguarde o deploy automático)

## ✅ Passo 3: Testar Notificações

1. **Acesse o dashboard**: `https://seu-dominio.vercel.app`
2. **Permita notificações**: Quando o navegador solicitar permissão, clique em **Permitir**
3. **Aguarde**: O sistema registra automaticamente seu dispositivo
4. **Teste**: Quando um sinal atingir Take ou Stop Loss, você receberá uma notificação!

## 📱 Como Funciona

### Para o Usuário:

1. Acessa o dashboard no celular/desktop
2. Navegador solicita permissão de notificações
3. Usuário clica em **Permitir**
4. Sistema registra o dispositivo automaticamente
5. Quando um sinal atinge Take ou Stop Loss → **Notificação aparece!** 📲

### Funcionalidades:

- ✅ Notificações funcionam mesmo com navegador fechado (se permitido)
- ✅ Funciona em Android (Chrome/Edge) e iOS (Safari)
- ✅ Notificações aparecem quando:
  - ✅ Take 1 atingido
  - ✅ Take 2 atingido
  - ✅ Take 3 atingido
  - ✅ Stop Loss atingido

## 🎯 Mensagens de Notificação

### Take Atingido:
```
✅ TakePips - BUY BTCUSD
Take 1 atingido em 110425.95
```

### Stop Loss:
```
🛑 TakePips - SELL BTCUSD
Stop Loss atingido em 110095.33
```

## 🔍 Verificar se Está Funcionando

1. **Console do navegador** (F12):
   - Procure por: `✅ Service Worker registrado`
   - Procure por: `✅ Inscrito para push notifications`

2. **Banco de dados**:
   - Verifique a tabela `push_subscriptions`
   - Deve ter uma entrada com seu `endpoint`

3. **Teste manual** (opcional):
   - Crie uma função de teste no backend
   - Envie uma notificação de teste

## ❌ Problemas Comuns

### "VAPID keys não configuradas"
- **Solução**: Verifique se as variáveis estão configuradas na Vercel e faça redeploy

### "Permissão negada"
- **Solução**: 
  1. Vá em Configurações do navegador
  2. Permissões → Notificações
  3. Permita para o seu domínio
  4. Recarregue a página

### "Service Worker não registrado"
- **Solução**: 
  1. Verifique se o arquivo `/sw.js` existe em `public/sw.js`
  2. Verifique se está sendo servido corretamente
  3. Verifique o console para erros

### "Notificações não aparecem"
- **Solução**:
  1. Verifique se o dispositivo está registrado (banco de dados)
  2. Verifique logs do servidor quando um sinal é atualizado
  3. Teste se as VAPID keys estão corretas

## 🚀 Próximos Passos (Opcional)

### Criar Ícones:
Crie ícones para as notificações em `public/`:
- `icon-192.png` (192x192px)
- `badge-72.png` (72x72px)

### Personalizar Notificações:
Edite `src/shared/utils/pushNotifications.ts` para personalizar:
- Título das notificações
- Mensagens
- Ícones
- Ações (botões na notificação)

### PWA (Progressive Web App):

✅ **Já implementado!** O TakePips agora é um PWA completo!

#### Funcionalidades PWA:
- ✅ **Instalável**: Pode ser instalado no celular como app nativo
- ✅ **Offline**: Funciona offline com cache de recursos
- ✅ **Ícones**: Configurado para todos os tamanhos de ícone
- ✅ **Tema**: Cores e aparência personalizadas

#### Como Instalar no Celular:

**Android (Chrome/Edge):**
1. Acesse o dashboard no navegador
2. Menu (⋮) → **"Adicionar à tela inicial"** ou **"Instalar app"**
3. Confirme a instalação
4. O ícone aparecerá na tela inicial!

**iOS (Safari):**
1. Acesse o dashboard no Safari
2. Compartilhar (□↑) → **"Adicionar à Tela de Início"**
3. Personalize o nome (opcional)
4. Toque em **"Adicionar"**
5. O ícone aparecerá na tela inicial!

#### Ícones Necessários:

Você precisa criar ícones PNG nos seguintes tamanhos e colocar em `public/`:
- `icon-72.png` (72x72px)
- `icon-96.png` (96x96px)
- `icon-128.png` (128x128px)
- `icon-144.png` (144x144px)
- `icon-152.png` (152x152px)
- `icon-192.png` (192x192px) ⭐ **Principal**
- `icon-384.png` (384x384px)
- `icon-512.png` (512x512px) ⭐ **Principal**

**Dica:** Use ferramentas online como:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/
- Ou crie um ícone 512x512px e redimensione para os outros tamanhos

#### Testar PWA:
- **Chrome DevTools**: Application → Manifest (verifica configurações)
- **Lighthouse**: Testa PWA e dá pontuação
- **Teste offline**: Desconecte internet e veja se o app funciona

## 📚 Documentação

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)

