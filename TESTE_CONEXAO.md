# 🔍 Teste de Conexão - Guia Rápido

## 1️⃣ Verificar se o Servidor está Rodando

Abra o PowerShell e execute:

```powershell
npm run dev
```

**Você deve ver:**
```
🚀 Servidor rodando!
📡 Endpoint: http://localhost:3000/api/signals
💚 Health check: http://localhost:3000/health
```

Se não aparecer nada ou der erro, o servidor não está rodando.

## 2️⃣ Testar Health Check

**No PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

**Se der erro:** O servidor não está respondendo. Verifique:
- Servidor está rodando?
- Porta 3000 está livre?
- Firewall não está bloqueando?

## 3️⃣ Testar Endpoint de Sinais

```powershell
$body = @{
    name = "TakePips"
    type = "BUY"
    symbol = "XAUUSD"
    entry = 2385.15
    stopLoss = 2380.00
    take1 = 2395.00
    take2 = 2395.00
    take3 = 2395.00
    stopTicks = 515
    time = "2025.10.31 22:40:02"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/signals" -Method POST -Body $body -ContentType "application/json"
```

**Se funcionar:** O servidor está OK, o problema é no MT5.
**Se não funcionar:** Verifique o servidor e o banco de dados.

## 4️⃣ Descobrir IP da Máquina

```powershell
ipconfig | Select-String "IPv4"
```

Procure algo como: `192.168.1.XXX` ou `10.0.0.XXX`

## 5️⃣ Configurar MT5

### Passo 1: Adicionar URL nas URLs Permitidas

1. **Tools → Options**
2. Aba **Expert Advisors**
3. ✅ Marque **"Allow WebRequest for listed URL"**
4. Adicione (uma por linha):
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```
5. Se localhost não funcionar, adicione também:
   ```
   http://192.168.1.XXX:3000/*
   ```
   (Substitua XXX pelo seu IP)
6. Clique **OK**
7. **REINICIE O MT5** ⚠️ IMPORTANTE!

### Passo 2: Configurar URL no Indicador

1. Botão direito no indicador → **Propriedades**
2. No campo `EndpointURL`, use:
   - `http://localhost:3000/api/signals` (tente primeiro)
   - OU `http://192.168.1.XXX:3000/api/signals` (se localhost não funcionar)

## 6️⃣ Checklist Final

- [ ] Servidor rodando (`npm run dev`)
- [ ] Health check funciona (`/health`)
- [ ] Teste manual funciona (cURL/PowerShell)
- [ ] URL adicionada no MT5 (Expert Advisors)
- [ ] MT5 reiniciado após adicionar URL
- [ ] URL configurada no indicador
- [ ] Indicador recompilado

## 🔴 Se Ainda Não Funcionar

### Opção 1: Usar ngrok (para testar)

1. Instale ngrok: https://ngrok.com
2. Execute:
   ```powershell
   ngrok http 3000
   ```
3. Use a URL do ngrok no MT5 (ex: `http://abc123.ngrok.io/api/signals`)

### Opção 2: Verificar Firewall

1. Windows Defender → Firewall
2. Permitir aplicativo através do firewall
3. Adicione:
   - Node.js
   - MetaTrader 5
   - Porta 3000

### Opção 3: Verificar se Porta está Livre

```powershell
netstat -ano | findstr :3000
```

Se aparecer algo, algo já está usando a porta 3000.

Mude a porta no `.env`:
```
PORT=3001
```

E atualize tudo para porta 3001.

