# ✅ Checklist de Diagnóstico - Push Notifications

## 📊 Situação Atual

- ✅ **Backend funcionando**: Web Push envia notificações (2 subscriptions)
- ❌ **App não registra token**: 0 tokens Expo no banco
- ❌ **Nenhuma requisição para `/api/push/subscribe`** nos logs do backend

## 🔍 Diagnóstico Necessário

### ⚠️ IMPORTANTE: Precisamos dos logs do app para diagnosticar!

Os logs do backend mostram que o app **não está fazendo requisições** para registrar o token. Isso significa que o problema está no app, não no backend.

## ✅ Checklist

### 1. Gerar Novo APK com Logs

- [ ] **Gerar novo APK** com as mudanças de logs:
  ```bash
  cd mobile
  eas build -p android --profile preview
  ```
  
- [ ] **Aguardar build completar** (pode levar 10-20 minutos)

### 2. Instalar APK no Dispositivo

- [ ] **Baixar APK** do EAS Build
- [ ] **Instalar no dispositivo Android**
- [ ] **Conceder permissões** quando solicitado (especialmente notificações)

### 3. Ver Logs do App

- [ ] **Conectar dispositivo via USB**
- [ ] **Verificar conexão**:
  ```bash
  adb devices
  ```
  
- [ ] **Ver logs em tempo real**:
  ```bash
  adb logcat -c  # Limpar logs antigos
  adb logcat | grep -E "\[usePushNotifications\]|\[NotificationService\]|\[RootLayout\]"
  ```

### 4. Abrir o App e Observar

- [ ] **Abrir o app TakePips** no dispositivo
- [ ] **Aguardar alguns segundos** (o registro deve acontecer automaticamente)
- [ ] **Observar logs no terminal**

### 5. Verificar o Que Aparece nos Logs

#### ✅ **Cenário 1: Sucesso (Esperado)**

Se você ver:
```
[usePushNotifications] 🚀 Iniciando registro...
[NotificationService] Constants.appOwnership: standalone
[NotificationService] Permissão concedida: true
[NotificationService] ✅ Push token obtido com sucesso
[NotificationService] 📤 Registrando dispositivo no backend...
[NotificationService] ✅ Resposta recebida do backend!
```

**Ação**: Verificar se apareceu `[API] POST /api/push/subscribe` nos logs do backend.

#### ❌ **Cenário 2: App Detectado como Expo Go**

Se você ver:
```
[NotificationService] Constants.appOwnership: expo
[NotificationService] ⚠️ Expo Go detectado
```

**Problema**: O APK não foi gerado corretamente ou está rodando no Expo Go.

**Solução**: 
- Certifique-se de que o APK foi gerado com `eas build`
- Não use Expo Go, use o APK instalado

#### ❌ **Cenário 3: Permissões Negadas**

Se você ver:
```
[NotificationService] Permissão concedida: false
```

**Problema**: Permissões de notificação não foram concedidas.

**Solução**: 
1. Vá em **Configurações** > **Apps** > **TakePips** > **Notificações**
2. Ative as notificações
3. Reabra o app

#### ❌ **Cenário 4: Erro de Rede**

Se você ver:
```
[NotificationService] ❌ Requisição feita mas sem resposta do servidor
```

**Problema**: App não consegue se conectar ao backend.

**Solução**: 
- Verificar conexão de internet
- Verificar se a URL do backend está correta (deve ser `https://takepips.vercel.app`)

#### ❌ **Cenário 5: Nenhum Log Aparece**

Se você **não ver nenhum log** começando com `[usePushNotifications]`:

**Problema**: O hook não está sendo executado ou o app não está rodando o código atualizado.

**Solução**: 
- Certifique-se de que o APK foi gerado **depois** das mudanças de logs
- Tente limpar e reinstalar o app
- Verifique se há erros no build

### 6. Verificar Backend

- [ ] **Verificar logs da Vercel** após abrir o app
- [ ] **Procurar por**: `[API] POST /api/push/subscribe`
- [ ] **Se aparecer**: ✅ Token foi registrado!
- [ ] **Se não aparecer**: ❌ App não está fazendo requisição (ver logs do app)

### 7. Verificar Banco de Dados

- [ ] **Executar query no Supabase**:
  ```sql
  SELECT * FROM expo_push_tokens ORDER BY created_at DESC;
  ```
- [ ] **Se retornar registros**: ✅ Token foi salvo!
- [ ] **Se não retornar nada**: ❌ Token não foi registrado (ver logs do app)

## 📤 Compartilhar Resultados

Após seguir o checklist, compartilhe:

1. **Logs do app** (tudo que começa com `[usePushNotifications]` ou `[NotificationService]`)
2. **Se apareceu** `[API] POST /api/push/subscribe` nos logs do backend
3. **Resultado da query** no banco de dados

## 🎯 Próximos Passos

Com os logs do app, poderemos identificar exatamente onde está o problema:

- Se o app está detectando como Expo Go
- Se as permissões foram concedidas
- Se o token foi obtido
- Se a requisição foi feita
- Qual erro ocorreu (se houver)

---

**⚠️ Lembre-se**: Sem os logs do app, não conseguimos diagnosticar o problema. É essencial seguir os passos acima!

