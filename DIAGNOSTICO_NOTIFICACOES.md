# 🔍 Diagnóstico de Notificações Push - Android APK

## Problema
Notificações não estão sendo recebidas no app Android instalado via APK.

## Passos para Diagnosticar

### 1. Verificar se o token está sendo registrado

**No app (logs do React Native):**
Procure por estas mensagens quando o app abre:
```
[usePushNotifications] Iniciando registro...
[NotificationService] Push token obtido com sucesso
[NotificationService] Registrando dispositivo no backend...
[NotificationService] ✅ Device registered successfully
```

**Se não aparecer:**
- O app pode estar rodando no Expo Go (não funciona)
- Permissões de notificação não foram concedidas
- Verifique os logs completos do app

### 2. Verificar se o token está no banco de dados

**No Supabase Dashboard (SQL Editor):**
```sql
SELECT * FROM expo_push_tokens ORDER BY created_at DESC;
```

**O que esperar:**
- Deve haver pelo menos 1 registro
- Campo `token` deve começar com `ExponentPushToken[`
- Campo `platform` deve ser `android`
- Campo `device_id` deve ter o nome do dispositivo

**Se não houver registros:**
- O app não está conseguindo registrar o token
- Verifique os logs do backend em `/api/push/subscribe`

### 3. Verificar logs do backend ao criar sinal

**Quando um sinal é criado, você deve ver nos logs:**
```
[PUSH] Buscando tokens Expo na tabela expo_push_tokens...
[PUSH] ✅ Busca de tokens Expo concluída. Encontrados: X
[PUSH] Tokens encontrados:
[PUSH]   1. Token: ExponentPushToken[...] | Platform: android | Device: ...
[PUSH] Preparando X mensagem(ns) para Expo Push...
[PUSH] Enviando requisição para Expo Push API...
[PUSH] Status da resposta: 200 OK
[PUSH] ✅ Expo Push enviado para X dispositivo(s)
```

**Se aparecer:**
```
[PUSH] ⚠️ Nenhum subscriber encontrado no banco de dados
```
- Significa que não há tokens no banco
- O app não registrou o token corretamente

### 4. Verificar resposta da Expo Push API

**Nos logs do backend, procure por:**
```
[PUSH] Resultado completo: { ... }
```

**Possíveis problemas:**
- `status: "error"` - Token inválido ou expirado
- `status: "ok"` - Notificação enviada com sucesso

### 5. Verificar permissões no Android

**No dispositivo Android:**
1. Configurações → Apps → TakePips
2. Notificações → Verificar se está habilitado
3. Permissões → Verificar se "Notificações" está permitido

### 6. Testar manualmente

**Via Supabase (SQL Editor):**
```sql
-- Ver todos os tokens
SELECT * FROM expo_push_tokens;

-- Contar tokens
SELECT COUNT(*) as total_tokens FROM expo_push_tokens;

-- Ver tokens por plataforma
SELECT platform, COUNT(*) as total 
FROM expo_push_tokens 
GROUP BY platform;
```

## Soluções Comuns

### Problema: Token não está sendo registrado

**Solução:**
1. Verifique se o app está usando um APK (não Expo Go)
2. Verifique se as permissões foram concedidas
3. Verifique os logs do app para erros
4. Verifique se a API `/api/push/subscribe` está acessível

### Problema: Token está no banco mas notificações não chegam

**Solução:**
1. Verifique os logs do backend ao criar sinal
2. Verifique se a Expo Push API está retornando sucesso
3. Verifique se o token não está expirado (gerar novo APK pode ajudar)
4. Verifique permissões do Android

### Problema: Backend não encontra tokens

**Solução:**
1. Verifique se a tabela `expo_push_tokens` existe
2. Verifique se há registros na tabela
3. Verifique se o Supabase está configurado corretamente no backend
4. Verifique as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

## Próximos Passos

1. **Fazer deploy das mudanças** (logs adicionados)
2. **Gerar novo APK** com as mudanças
3. **Instalar e testar** no dispositivo
4. **Verificar logs** do app e do backend
5. **Compartilhar logs** se o problema persistir

## Logs Importantes para Compartilhar

Se o problema persistir, compartilhe:

1. **Logs do app** (quando abre):
   - Mensagens de `[usePushNotifications]`
   - Mensagens de `[NotificationService]`

2. **Logs do backend** (quando cria sinal):
   - Mensagens de `[PUSH]`
   - Especialmente: quantos tokens foram encontrados
   - Resposta da Expo Push API

3. **Resultado da query SQL**:
   ```sql
   SELECT * FROM expo_push_tokens;
   ```

