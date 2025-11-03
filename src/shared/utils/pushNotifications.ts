import webpush from 'web-push';
import { neon } from '@neondatabase/serverless';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Enviar notificação push para todos os subscribers
 */
export async function sendPushNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  console.log('[PUSH] sendPushNotification chamado:', { title, body });
  
  // Verificar se VAPID keys estão configuradas
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('[PUSH] ❌ VAPID keys não configuradas!');
    console.error('[PUSH] VAPID_PUBLIC_KEY:', process.env.VAPID_PUBLIC_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
    console.error('[PUSH] VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
    console.warn('[PUSH] Pulando envio de notificação.');
    return;
  }
  
  console.log('[PUSH] ✅ VAPID keys configuradas');

  // Normalizar VAPID_SUBJECT: deve ser uma URL mailto:
  const rawSubject = process.env.VAPID_SUBJECT || 'mailto:admin@takepips.com';
  console.log('[PUSH] VAPID_SUBJECT original (raw):', rawSubject);
  
  let vapidSubject = rawSubject;
  
  // Remover espaços em branco
  vapidSubject = vapidSubject.trim();
  console.log('[PUSH] VAPID_SUBJECT após trim:', vapidSubject);
  
  // Se não começar com mailto:, adicionar o prefixo
  if (!vapidSubject.toLowerCase().startsWith('mailto:')) {
    vapidSubject = `mailto:${vapidSubject}`;
    console.log('[PUSH] VAPID_SUBJECT normalizado para:', vapidSubject);
  } else {
    console.log('[PUSH] VAPID_SUBJECT já está no formato correto:', vapidSubject);
  }

  // Validar que é uma URL válida
  try {
    new URL(vapidSubject);
    console.log('[PUSH] ✅ VAPID_SUBJECT é uma URL válida');
  } catch (error) {
    console.error('[PUSH] ❌ VAPID_SUBJECT não é uma URL válida:', vapidSubject);
    throw new Error(`VAPID_SUBJECT deve ser uma URL válida no formato mailto:email@exemplo.com. Valor recebido: ${vapidSubject}`);
  }

  // Configurar VAPID
  console.log('[PUSH] Configurando VAPID com subject:', vapidSubject);
  webpush.setVapidDetails(
    vapidSubject,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('[PUSH] ✅ VAPID configurado com sucesso');

  if (!process.env.DATABASE_URL) {
    console.error('[PUSH] DATABASE_URL não configurada');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Garantir que a tabela existe
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        endpoint TEXT UNIQUE NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `.catch(err => {
      console.warn('[PUSH] Tabela já existe ou erro ao criar:', err.message);
    });

    // Buscar todas as subscriptions
    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth
      FROM push_subscriptions
    `;

    if (!subscriptions || subscriptions.length === 0) {
      console.warn('[PUSH] ⚠️ Nenhuma subscription encontrada no banco de dados');
      console.warn('[PUSH] Verifique se há usuários inscritos na tabela push_subscriptions');
      return;
    }

    console.log(`[PUSH] ✅ Encontradas ${subscriptions.length} subscription(s)`);
    console.log(`[PUSH] Enviando notificação para ${subscriptions.length} dispositivo(s)`);

    // Preparar payload da notificação
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      tag: 'takepips-notification',
      requireInteraction: false,
      data: data || {},
    });

    // Enviar para cada subscription
    const sendPromises = subscriptions.map(async (sub: any) => {
      try {
        const subscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(subscription, payload);
        console.log(`[PUSH] ✅ Notificação enviada para: ${sub.endpoint.substring(0, 50)}...`);
      } catch (error: any) {
        console.error(`[PUSH] ❌ Erro ao enviar para ${sub.endpoint.substring(0, 50)}...:`, error);

        // Se a subscription expirou ou é inválida, remover do banco
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`[PUSH] 🗑️ Removendo subscription inválida: ${sub.endpoint.substring(0, 50)}...`);
          await sql`
            DELETE FROM push_subscriptions
            WHERE endpoint = ${sub.endpoint}
          `;
        }
      }
    });

    await Promise.allSettled(sendPromises);
    console.log('[PUSH] ✅ Processo de envio concluído');
  } catch (error) {
    console.error('[PUSH] ❌ Erro ao buscar subscriptions:', error);
  }
}

/**
 * Enviar notificação quando um novo sinal é recebido
 */
export async function notifyNewSignal(
  signalType: 'BUY' | 'SELL',
  symbol: string,
  entry: number,
  stopLoss: number,
  take1: number
): Promise<void> {
  console.log('[PUSH] notifyNewSignal chamado:', { signalType, symbol, entry, stopLoss, take1 });
  
  const emoji = signalType === 'BUY' ? '📈' : '📉';
  const title = `${emoji} Novo Sinal ${signalType} - ${symbol}`;
  const body = `Entry: ${entry.toFixed(2)} | Stop: ${stopLoss.toFixed(2)} | Take1: ${take1.toFixed(2)}`;

  console.log('[PUSH] Preparando notificação:', { title, body });

  await sendPushNotification(title, body, {
    signalType,
    symbol,
    entry,
    stopLoss,
    take1,
    event: 'NEW_SIGNAL',
    timestamp: new Date().toISOString(),
  });
  
  console.log('[PUSH] notifyNewSignal concluído');
}

/**
 * Enviar notificação quando um sinal atinge Take ou Stop Loss
 */
export async function notifySignalUpdate(
  signalType: 'BUY' | 'SELL',
  symbol: string,
  status: 'STOP_LOSS' | 'TAKE1' | 'TAKE2' | 'TAKE3',
  hitPrice: number
): Promise<void> {
  const statusText = {
    STOP_LOSS: 'Stop Loss',
    TAKE1: 'Take 1',
    TAKE2: 'Take 2',
    TAKE3: 'Take 3',
  };

  const emoji = status === 'STOP_LOSS' ? '🛑' : '✅';
  const title = `${emoji} TakePips - ${signalType} ${symbol}`;
  const body = `${statusText[status]} atingido em ${hitPrice.toFixed(2)}`;

  await sendPushNotification(title, body, {
    signalType,
    symbol,
    status,
    hitPrice,
    event: 'SIGNAL_UPDATE',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Enviar notificação quando a entrada é atingida (sinal entra em operação)
 */
export async function notifyEntryHit(
  signalType: 'BUY' | 'SELL',
  symbol: string,
  entryPrice: number
): Promise<void> {
  console.log('[PUSH] notifyEntryHit chamado:', { signalType, symbol, entryPrice });
  
  const emoji = signalType === 'BUY' ? '📈' : '📉';
  const title = `🎯 ${emoji} Sinal ${signalType} em Operação - ${symbol}`;
  const body = `Entrada atingida em ${entryPrice.toFixed(2)}`;

  console.log('[PUSH] Preparando notificação de entrada:', { title, body });

  await sendPushNotification(title, body, {
    signalType,
    symbol,
    entryPrice,
    event: 'ENTRY_HIT',
    timestamp: new Date().toISOString(),
  });

  console.log('[PUSH] notifyEntryHit concluído');
}

/**
 * Enviar notificação quando os valores de um sinal são atualizados (entry, stops, takes)
 */
export async function notifySignalDataUpdate(
  signalType: 'BUY' | 'SELL',
  symbol: string,
  entry: number,
  stopLoss: number,
  take1: number
): Promise<void> {
  console.log('[PUSH] notifySignalDataUpdate chamado:', { signalType, symbol, entry, stopLoss, take1 });
  
  const emoji = signalType === 'BUY' ? '📈' : '📉';
  const title = `🔄 ${emoji} Sinal ${signalType} Atualizado - ${symbol}`;
  const body = `Entry: ${entry.toFixed(2)} | Stop: ${stopLoss.toFixed(2)} | Take1: ${take1.toFixed(2)}`;

  console.log('[PUSH] Preparando notificação de atualização:', { title, body });

  await sendPushNotification(title, body, {
    signalType,
    symbol,
    entry,
    stopLoss,
    take1,
    event: 'SIGNAL_DATA_UPDATE',
    timestamp: new Date().toISOString(),
  });
  
  console.log('[PUSH] notifySignalDataUpdate concluído');
}

