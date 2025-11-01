# 🔍 Troubleshooting - Notificações Push Não Aparecem

## ✅ Checklist Rápido

Use este checklist para diagnosticar o problema:

- [ ] VAPID keys configuradas na Vercel?
- [ ] Permissão de notificação concedida no navegador?
- [ ] Service Worker registrado?
- [ ] Subscription salva no banco de dados?
- [ ] Dispositivo está online?
- [ ] Navegador suporta notificações?

---

## 🔴 Problema 1: Permissão Negada ou Não Solicitada

### Sintomas:
- Console mostra: `⚠️ Permissão de notificação negada pelo usuário`
- Ou nunca aparece popup pedindo permissão

### Soluções:

**1. Verificar Permissões do Navegador:**

**Chrome/Edge:**
1. Clique no ícone de cadeado/segurança na barra de endereços
2. Vá em **Configurações do site**
3. Verifique se **Notificações** está permitido
4. Se estiver bloqueado, mude para **Permitir**

**Firefox:**
1. Clique no ícone de cadeado
2. Vá em **Mais informações** → **Permissões**
3. Verifique **Notificações**

**Safari (iOS):**
1. Ajustes → Safari → Configurações do Website → Notificações
2. Verifique se seu site está permitido

**2. Solicitar Permissão Manualmente:**

No console do navegador (F12), execute:
```javascript
window.requestNotificationPermission()
```

Ou adicione um botão no dashboard para solicitar manualmente.

**3. Limpar Permissões e Tentar Novamente:**
1. Acesse as configurações do site (ícone de cadeado)
2. **Redefinir permissões**
3. Recarregue a página
4. Permita novamente quando solicitado

---

## 🔴 Problema 2: Service Worker Não Registrado

### Sintomas:
- Console mostra: `❌ Service Worker não disponível`
- Ou nenhuma mensagem sobre Service Worker

### Verificar:
1. Abra DevTools (F12)
2. Aba **Application** → **Service Workers**
3. Verifique se está registrado

### Soluções:

**1. Verificar se o arquivo existe:**
```bash
# Deve existir: public/sw.js
```

**2. Verificar se está sendo servido:**
- Acesse: `https://seu-dominio.vercel.app/sw.js`
- Deve mostrar o código do Service Worker (não erro 404)

**3. Forçar Registro:**
No console do navegador:
```javascript
navigator.serviceWorker.register('/sw.js')
  .then(reg => console.log('✅ Service Worker registrado:', reg))
  .catch(err => console.error('❌ Erro:', err));
```

**4. Limpar Service Workers Antigos:**
1. DevTools → Application → Service Workers
2. Clique em **Unregister** nos workers antigos
3. Recarregue a página

---

## 🔴 Problema 3: VAPID Keys Não Configuradas

### Sintomas:
- Console mostra: `❌ Não foi possível obter VAPID public key`
- Console mostra: `VAPID keys não configuradas`

### Verificar:
1. Vercel Dashboard → Settings → Environment Variables
2. Verifique se existem:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

### Soluções:

**1. Gerar Novas Chaves:**
```bash
node scripts/generate-vapid-keys.js
```

**2. Adicionar na Vercel:**
1. Copie as 3 variáveis geradas
2. Vercel → Settings → Environment Variables
3. Adicione cada uma
4. **Faça redeploy** (ou aguarde deploy automático)

**3. Verificar se Chaves Estão Corretas:**
Acesse: `https://seu-dominio.vercel.app/api/push/vapid-public-key`

Deve retornar:
```json
{
  "success": true,
  "data": {
    "publicKey": "BIMiQb8l7Oqh5t_dyWSBohJM_fzNZNzGggr1eXGgzWh8kDd4ddCkVK0ONWPUXQpJNRfbujnp-Nrlmqes4qE_dCw"
  }
}
```

Se retornar erro, as chaves não estão configuradas corretamente.

---

## 🔴 Problema 4: Subscription Não Foi Salva

### Sintomas:
- Não aparece erro, mas notificações não chegam
- Subscription não está no banco

### Verificar:

**1. Ver Console do Navegador:**
Procure por: `✅ Subscription salva no servidor`

**2. Verificar Banco de Dados:**
```sql
SELECT * FROM push_subscriptions;
```

Deve ter pelo menos uma linha com seu endpoint.

**3. Testar Endpoint Manualmente:**
No console do navegador:
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    if (sub) {
      fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
              auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth'))))
            }
          }
        })
      }).then(r => r.json()).then(console.log);
    }
  });
});
```

### Soluções:

**1. Forçar Nova Subscription:**
No console:
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(await getVapidPublicKey())
  }).then(sub => {
    console.log('Nova subscription:', sub);
    // Enviar para servidor manualmente
  });
});
```

---

## 🔴 Problema 5: Notificações Bloqueadas pelo Navegador

### Sintomas:
- Console mostra: `NotAllowedError`
- Permissão está como "Bloqueado"

### Soluções:

**Chrome/Edge:**
1. `chrome://settings/content/notifications`
2. Encontre seu domínio na lista
3. Mude para **Permitir**

**Firefox:**
1. `about:preferences#privacy`
2. Permissões → Notificações → Configurações
3. Encontre seu site e permita

**Safari:**
1. Safari → Preferências → Websites → Notificações
2. Encontre seu site e permita

**Mobile (Android):**
1. Configurações → Apps → Chrome → Notificações
2. Verifique se está ativado

**Mobile (iOS):**
1. Ajustes → Notificações → Safari
2. Verifique se está ativado

---

## 🔴 Problema 6: Notificações Não São Enviadas Quando Sinal Atualiza

### Sintomas:
- Permissão OK, Service Worker OK, mas nada acontece quando Take/Stop é atingido

### Verificar:

**1. Verificar Logs do Servidor (Vercel):**
1. Vercel Dashboard → Deployments → Logs
2. Procure por mensagens `[PUSH]`
3. Deve aparecer: `✅ Notificação enviada para: ...`

**2. Verificar se Função Está Sendo Chamada:**
No código, quando um sinal é atualizado, deve chamar:
```typescript
notifySignalUpdate(signal.type, signal.symbol, status, hitPrice)
```

**3. Verificar Subscriptions no Banco:**
```sql
SELECT COUNT(*) FROM push_subscriptions;
```
Se for 0, ninguém está inscrito.

### Soluções:

**1. Testar Envio Manual:**
Crie um endpoint de teste:

```typescript
// api/push/test.ts (temporário)
import { sendPushNotification } from '../../src/shared/utils/pushNotifications';

export default async function handler(req, res) {
  await sendPushNotification(
    'Teste TakePips',
    'Esta é uma notificação de teste!',
    { test: true }
  );
  res.json({ success: true, message: 'Notificação enviada' });
}
```

Acesse: `https://seu-dominio.vercel.app/api/push/test`

**2. Verificar Se Há Erros no Código:**
O código de envio está em `src/shared/utils/pushNotifications.ts`
Verifique se não há erros de sintaxe.

---

## 🔴 Problema 7: Navegador Não Suporta

### Sintomas:
- Console: `❌ Este navegador não suporta notificações`
- Ou Service Worker não disponível

### Verificar Suporte:

No console:
```javascript
console.log('Notifications:', 'Notification' in window);
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Push Manager:', 'PushManager' in window);
```

### Soluções:

**Navegadores Suportados:**
- ✅ Chrome (Android/Desktop)
- ✅ Edge (Android/Desktop)
- ✅ Firefox (Desktop - suporte limitado)
- ✅ Safari (iOS 16.4+ / macOS)
- ❌ Opera Mini (não suporta)
- ❌ Internet Explorer (não suporta)

**Mobile:**
- ✅ Android Chrome/Edge
- ✅ iOS Safari (16.4+)
- ❌ Outros navegadores iOS podem ter limitações

---

## 🔴 Problema 8: HTTPS Necessário

### Sintomas:
- Service Worker não registra
- Notificações não funcionam

### Importante:
**Service Workers e Push Notifications REQUEREM HTTPS!**

- ✅ `https://takepips.vercel.app` → Funciona
- ❌ `http://localhost:3000` → Funciona apenas em localhost
- ❌ `http://192.168.1.x` → NÃO funciona

### Soluções:

**Desenvolvimento Local:**
Use `localhost` (HTTP funciona apenas para localhost)
OU use ngrok para criar túnel HTTPS

**Produção:**
Certifique-se de usar HTTPS sempre na Vercel

---

## 🛠️ Ferramentas de Debug

### 1. Console do Navegador (F12)
Verifique mensagens de erro ou sucesso

### 2. DevTools → Application
- **Service Workers**: Ver registros
- **Storage**: Ver cache
- **Manifest**: Ver configurações PWA

### 3. Testar Subscription:
```javascript
// No console do navegador
navigator.serviceWorker.ready.then(async reg => {
  const sub = await reg.pushManager.getSubscription();
  console.log('Subscription atual:', sub);
  if (!sub) {
    console.log('⚠️ Nenhuma subscription encontrada');
  } else {
    console.log('✅ Subscription:', {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.getKey('p256dh') ? 'Presente' : 'Ausente',
        auth: sub.getKey('auth') ? 'Presente' : 'Ausente'
      }
    });
  }
});
```

### 4. Verificar Permissão:
```javascript
console.log('Permissão:', Notification.permission);
```

### 5. Testar Notificação Local:
```javascript
// Isso testa se o navegador permite notificações
new Notification('Teste TakePips', {
  body: 'Se você vê isso, as notificações funcionam!',
  icon: '/icon-192.png'
});
```

---

## 📋 Checklist Completo de Diagnóstico

Execute este checklist na ordem:

1. ✅ **VAPID Keys configuradas?**
   - Vercel → Environment Variables
   - Teste: `/api/push/vapid-public-key`

2. ✅ **Service Worker registrado?**
   - DevTools → Application → Service Workers
   - Teste: `/sw.js` deve carregar

3. ✅ **Permissão concedida?**
   - Console: `Notification.permission` deve ser `"granted"`
   - Configurações do site → Notificações

4. ✅ **Subscription salva?**
   - Console: Deve aparecer `✅ Subscription salva no servidor`
   - Banco: Verificar tabela `push_subscriptions`

5. ✅ **Navegador suporta?**
   - Chrome/Edge: ✅
   - Safari iOS: ✅ (16.4+)
   - Firefox: ⚠️ (limitado)

6. ✅ **Usa HTTPS?**
   - Deve ser `https://` (não `http://`)

7. ✅ **Quando sinal atualiza, envia notificação?**
   - Verificar logs do Vercel
   - Deve aparecer `[PUSH] Enviando notificação`

---

## 🆘 Se Nada Funcionar

1. **Limpar Tudo e Começar de Novo:**
   ```javascript
   // No console do navegador
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister());
   });
   
   // Limpar cache
   caches.keys().then(keys => {
     keys.forEach(key => caches.delete(key));
   });
   
   // Recarregar página
   location.reload();
   ```

2. **Verificar Logs do Vercel:**
   - Procure por erros relacionados a `[PUSH]` ou `pushNotifications`

3. **Testar em Outro Dispositivo/Navegador:**
   - Isso ajuda a identificar se é problema específico do ambiente

4. **Contatar Suporte:**
   - Envie os logs do console e do Vercel
   - Informe qual navegador/dispositivo está usando

---

## ✅ Comandos Úteis para Debug

**Testar se Subscription existe:**
```javascript
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(console.log)
);
```

**Forçar nova subscription:**
```javascript
navigator.serviceWorker.ready.then(async reg => {
  await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(await (await fetch('/api/push/vapid-public-key')).json().then(d => d.data.publicKey))
  }).then(console.log);
});
```

**Ver todas as subscriptions no banco:**
```sql
SELECT endpoint, created_at FROM push_subscriptions ORDER BY created_at DESC;
```

