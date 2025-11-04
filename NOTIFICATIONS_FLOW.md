# 🔔 Fluxo de Notificações Push - TakePips

## ✅ Quando as notificações são enviadas

### 1. 📊 **Novo Sinal Criado**
**Endpoint**: `POST /api/signals`
**Arquivo**: `src/presentation/controllers/SignalController.ts:39`
**Função**: `notifyNewSignal()`

**Exemplo**:
```
📈 Novo Sinal BUY - XAUUSD.c
Entry: 2650.50 | Stop: 2645.00 | Take1: 2655.00
```

**Quando**: Sempre que um novo sinal é criado via MT5

---

### 2. 🔄 **Sinal Atualizado (Valores)**
**Endpoint**: `PATCH /api/signals/[id]`
**Arquivo**: `api/signals/[id].ts:140`
**Função**: `notifySignalDataUpdate()`

**Exemplo**:
```
🔄 📈 Sinal BUY Atualizado - XAUUSD.c
Alterado: Entrada, Stop Loss
Entry: 2651.00 | Stop: 2644.50 | Take1: 2655.00
```

**Quando**: Valores são modificados (entry, stopLoss, take1, take2, take3, stopTicks)
**Detalhes**:
- ✅ Mostra quais campos foram alterados
- ✅ Só envia se realmente houve mudança (não envia se valores são iguais)
- ✅ Traduz nomes dos campos para português

---

### 3. 🎯 **Entrada Atingida (EM_OPERACAO)**
**Endpoint**: `PATCH /api/signals/update-status`
**Arquivo**: `api/signals/update-status.ts:120`
**Função**: `notifyEntryHit()`

**Exemplo**:
```
🎯 📈 Sinal BUY em Operação - XAUUSD.c
Entrada atingida em 2650.50
```

**Quando**: Status muda para `EM_OPERACAO` (preço atingiu a entrada)

---

### 4. ✅ **Take Profit Atingido**
**Endpoint**: `PATCH /api/signals/update-status`
**Arquivo**: `api/signals/update-status.ts:126`
**Função**: `notifySignalUpdate()`

**Exemplos**:
```
✅ TakePips - BUY XAUUSD.c
Take 1 atingido em 2655.00
```

```
✅ TakePips - BUY XAUUSD.c
Take 2 atingido em 2660.00
```

```
✅ TakePips - BUY XAUUSD.c
Take 3 atingido em 2665.00
```

**Quando**: Status muda para `TAKE1`, `TAKE2`, ou `TAKE3`
**Nota**: Take 3 automaticamente encerra o sinal

---

### 5. 🛑 **Stop Loss Atingido**
**Endpoint**: `PATCH /api/signals/update-status`
**Arquivo**: `api/signals/update-status.ts:126`
**Função**: `notifySignalUpdate()`

**Exemplo**:
```
🛑 TakePips - BUY XAUUSD.c
Stop Loss atingido em 2645.00
```

**Quando**: Status muda para `STOP_LOSS`

---

## 📋 Resumo de Endpoints

| Ação | Endpoint | Notificação | Emoji |
|------|----------|-------------|-------|
| Criar sinal | `POST /api/signals` | Novo sinal | 📈/📉 |
| Atualizar valores | `PATCH /api/signals/[id]` | Atualização com campos alterados | 🔄 |
| Entrada atingida | `PATCH /api/signals/update-status` (EM_OPERACAO) | Entrada hit | 🎯 |
| Take 1 atingido | `PATCH /api/signals/update-status` (TAKE1) | Take atingido | ✅ |
| Take 2 atingido | `PATCH /api/signals/update-status` (TAKE2) | Take atingido | ✅ |
| Take 3 atingido | `PATCH /api/signals/update-status` (TAKE3) | Take atingido (encerra) | ✅ |
| Stop Loss atingido | `PATCH /api/signals/update-status` (STOP_LOSS) | Stop hit | 🛑 |

---

## 🔍 Como verificar se está funcionando

### 1. **Logs do Vercel**

Acesse: https://vercel.com/guustavogomes/takepips/logs

Procure por:
```
[PUSH] ✅ Expo Push enviado para X dispositivo(s)
[PUSH] notifyNewSignal chamado
[PUSH] notifySignalDataUpdate chamado
[PUSH] notifyEntryHit chamado
[PUSH] notifySignalUpdate chamado
```

### 2. **Verificar tokens registrados**

No Supabase:
```sql
-- Ver tokens ativos
SELECT * FROM expo_push_tokens ORDER BY created_at DESC;

-- Contar quantos dispositivos
SELECT COUNT(*) as total_devices FROM expo_push_tokens;
```

### 3. **Testar manualmente**

Crie sinais via MT5 ou diretamente na API:

```bash
# Criar novo sinal
curl -X POST https://takepips.vercel.app/api/signals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GOLD Compra",
    "type": "BUY",
    "symbol": "XAUUSD.c",
    "entry": 2650.50,
    "stopLoss": 2645.00,
    "take1": 2655.00,
    "take2": 2660.00,
    "take3": 2665.00,
    "stopTicks": 55,
    "time": "2025.11.04 12:00:00"
  }'

# Atualizar valores (mostrará campos alterados)
curl -X PATCH https://takepips.vercel.app/api/signals/[ID] \
  -H "Content-Type: application/json" \
  -d '{
    "entry": 2651.00,
    "stopLoss": 2644.50
  }'

# Entrada atingida
curl -X PATCH https://takepips.vercel.app/api/signals/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "id": "[ID]",
    "status": "EM_OPERACAO",
    "hitPrice": 2650.50
  }'

# Take 1 atingido
curl -X PATCH https://takepips.vercel.app/api/signals/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "id": "[ID]",
    "status": "TAKE1",
    "hitPrice": 2655.00
  }'
```

---

## 🎯 Melhorias Implementadas

### ✅ Detecção de Campos Alterados
- Compara valores antes e depois da atualização
- Só notifica se realmente houve mudança
- Mostra na mensagem quais campos foram alterados

### ✅ Tradução para Português
- `entry` → "Entrada"
- `stopLoss` → "Stop Loss"
- `take1/2/3` → "Take 1/2/3"
- `stopTicks` → "Stop Ticks"

### ✅ Emojis Descritivos
- 📈 BUY / 📉 SELL
- 🔄 Atualização
- 🎯 Entrada atingida
- ✅ Take atingido
- 🛑 Stop Loss

### ✅ Dados Completos
- Todas as notificações incluem `data` com informações extras
- Facilita navegação no app ao tocar na notificação
- Timestamp para rastreamento

---

## 📱 Comportamento no App

### Quando o app está **FECHADO** ou em **BACKGROUND**:
- Notificação aparece na bandeja do Android
- Toque na notificação abre o app
- Som e vibração (se habilitado)

### Quando o app está **ABERTO**:
- Notificação aparece como banner no topo
- Não interrompe a navegação
- Sons e alertas visuais

---

## 🐛 Troubleshooting

### Notificações não chegam

1. **Verificar token no banco**:
   ```sql
   SELECT * FROM expo_push_tokens WHERE token LIKE 'ExponentPushToken%';
   ```

2. **Verificar logs do Vercel** para erros

3. **Testar envio manual** via Expo:
   ```bash
   curl -H "Content-Type: application/json" \
        -X POST https://exp.host/--/api/v2/push/send \
        -d '{
          "to": "ExponentPushToken[...]",
          "title": "Teste",
          "body": "Notificação de teste"
        }'
   ```

4. **Verificar permissões** no dispositivo Android

---

## 📊 Métricas

Para cada notificação enviada, os logs mostram:
- ✅ Quantos dispositivos receberam (Web Push)
- ✅ Quantos dispositivos receberam (Expo Push)
- ✅ Eventuais erros ou falhas
- ✅ Tokens inválidos removidos automaticamente

