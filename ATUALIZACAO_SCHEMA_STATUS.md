# 📊 Atualização do Schema - Rastreamento de Status

## 🎯 O que foi adicionado

A tabela `signals` agora rastreia quando cada nível (stop loss ou takes) é atingido:

### Novos Campos:

- **`status`**: Status atual do sinal (`PENDING`, `STOP_LOSS`, `TAKE1`, `TAKE2`, `TAKE3`)
- **`stop_hit_at`**: Timestamp quando o stop loss foi atingido
- **`take1_hit_at`**: Timestamp quando o take 1 foi atingido
- **`take2_hit_at`**: Timestamp quando o take 2 foi atingido
- **`take3_hit_at`**: Timestamp quando o take 3 foi atingido
- **`stop_hit_price`**: Preço exato quando o stop loss foi atingido
- **`take1_hit_price`**: Preço exato quando o take 1 foi atingido
- **`take2_hit_price`**: Preço exato quando o take 2 foi atingido
- **`take3_hit_price`**: Preço exato quando o take 3 foi atingido

## 📋 Como Atualizar o Banco de Dados

### Opção 1: Executar Migration SQL

1. Acesse o **Neon Console**: https://console.neon.tech
2. Vá até seu projeto
3. Clique em **SQL Editor**
4. Copie e cole o conteúdo do arquivo `src/infrastructure/database/migration_add_status_tracking.sql`
5. Execute o script

### Opção 2: Schema Completo (se for criar do zero)

Se você ainda não criou a tabela, execute o arquivo `src/infrastructure/database/schema.sql` que já inclui todos os campos novos.

## 🔌 Novo Endpoint de Atualização

### PATCH /api/signals/update-status

**URL:** `https://takepips.vercel.app/api/signals/update-status`

**Método:** `PATCH` ou `POST`

**Body:**
```json
{
  "id": "uuid-do-sinal",
  "status": "STOP_LOSS",
  "hitPrice": 2380.50
}
```

**Status válidos:**
- `STOP_LOSS` - Quando o stop loss é atingido
- `TAKE1` - Quando o take 1 é atingido
- `TAKE2` - Quando o take 2 é atingido
- `TAKE3` - Quando o take 3 é atingido

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "TAKE1",
    "take1HitAt": "2025-11-01T15:30:00.000Z",
    "take1HitPrice": 2395.50,
    "updatedAt": "2025-11-01T15:30:00.000Z"
  }
}
```

## 📝 Exemplo de Uso (PowerShell)

```powershell
$body = @{
    id = "uuid-do-sinal-retornado-na-criacao"
    status = "TAKE1"
    hitPrice = 2395.50
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://takepips.vercel.app/api/signals/update-status" -Method POST -Body $body -ContentType "application/json"
```

## ✅ Próximos Passos

1. Execute a migration no banco de dados (Neon)
2. O EA será atualizado para monitorar os preços e enviar atualizações automaticamente

