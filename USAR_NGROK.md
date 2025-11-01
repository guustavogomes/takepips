# 🌐 Usar ngrok para Testar Localmente

Como o MT5 não conecta em IPs locais, vamos usar **ngrok** para criar um túnel público para seu servidor local.

## 📥 Instalar ngrok

1. Acesse: https://ngrok.com/download
2. Baixe para Windows
3. Extraia o arquivo `ngrok.exe`
4. Opcional: Adicione ao PATH ou coloque em uma pasta acessível

## 🚀 Usar ngrok

### Passo 1: Inicie o servidor local

```powershell
npm run dev
```

Certifique-se de que está rodando em `http://localhost:3000`

### Passo 2: Em outro terminal, inicie o ngrok

```powershell
ngrok http 3000
```

Você verá algo como:
```
Forwarding  https://abc123xyz.ngrok.io -> http://localhost:3000
```

### Passo 3: Use a URL do ngrok no MT5

1. **URLs permitidas no MT5:**
   - Tools → Options → Expert Advisors
   - Adicione: `https://abc123xyz.ngrok.io/*`
   - (Use a URL que apareceu no ngrok)

2. **URL no indicador:**
   - Propriedades do indicador
   - `EndpointURL`: `https://abc123xyz.ngrok.io/api/signals`
   - (Use a URL do ngrok + `/api/signals`)

3. **Reinicie o MT5**

## ⚠️ Importante

- A URL do ngrok muda toda vez que você reinicia (na versão gratuita)
- Se reiniciar o ngrok, atualize as URLs no MT5
- Para desenvolvimento, a versão gratuita é suficiente

## 🎯 Vantagens

- ✅ Testa localmente sem deploy
- ✅ Funciona com MT5 (endpoint externo)
- ✅ Não precisa configurar firewall
- ✅ Não precisa descobrir IP local

## 📝 Alternativa: Deploy na Vercel

Se preferir uma URL fixa, faça deploy na Vercel:

1. Configure `DATABASE_URL` na Vercel
2. Faça deploy
3. Use a URL da Vercel no MT5 (ex: `https://takepips.vercel.app/api/signals`)

