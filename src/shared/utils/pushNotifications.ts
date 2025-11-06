import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[PUSH] ❌ Supabase não configurado');
    console.error('[PUSH] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'NÃO CONFIGURADO');
    console.error('[PUSH] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'NÃO CONFIGURADO');
    return;
  }

  // Usar cliente Supabase JavaScript (mais confiável que conexão direta no Vercel)
  // O cliente Supabase funciona bem e é otimizado para serverless
  console.log('[PUSH] ✅ Usando cliente Supabase para buscar subscribers...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    }
  );

  try {
    console.log('[PUSH] Entrando no bloco try para buscar subscribers...');
    
    // Buscar todas as subscriptions (Web Push)
    console.log('[PUSH] Buscando Web Push subscriptions...');
    
    let subscriptions: any[] = [];
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth');
      
      if (error) {
        console.error('[PUSH] ❌ Erro ao buscar Web Push subscriptions:', error);
      } else {
        subscriptions = data || [];
        console.log('[PUSH] ✅ Query de Web Push subscriptions executada com sucesso');
        console.log(`[PUSH] Web Push subscriptions encontradas: ${subscriptions.length}`);
      }
    } catch (queryError) {
      console.error('[PUSH] ❌ Exceção ao executar query de Web Push:', queryError);
      if (queryError instanceof Error) {
        console.error('[PUSH] Mensagem de erro:', queryError.message);
      }
    }

    // Buscar todos os tokens Expo (React Native)
    console.log('[PUSH] Buscando tokens Expo na tabela expo_push_tokens...');
    
    let expoTokens: any[] = [];
    try {
      const { data, error } = await supabase
        .from('expo_push_tokens')
        .select('token, platform, device_id, created_at');
      
      if (error) {
        console.error('[PUSH] ❌ Erro ao buscar tokens Expo:', error);
      } else {
        expoTokens = data || [];
        console.log('[PUSH] ✅ Query de tokens Expo executada com sucesso');
        console.log(`[PUSH] Tokens Expo encontrados: ${expoTokens.length}`);
        
        if (expoTokens.length > 0) {
          console.log('[PUSH] Tokens encontrados:');
          expoTokens.forEach((tokenRow: any, index: number) => {
            console.log(`[PUSH]   ${index + 1}. Token: ${tokenRow.token.substring(0, 30)}... | Platform: ${tokenRow.platform} | Device: ${tokenRow.device_id}`);
          });
        }
      }
    } catch (queryError) {
      console.error('[PUSH] ❌ Exceção ao executar query de tokens Expo:', queryError);
      if (queryError instanceof Error) {
        console.error('[PUSH] Mensagem de erro:', queryError.message);
      }
    }
    
    console.log('[PUSH] Busca de tokens Expo concluída');

    const totalSubscribers = subscriptions.length + expoTokens.length;

    if (totalSubscribers === 0) {
      console.warn('[PUSH] ⚠️ Nenhum subscriber encontrado no banco de dados');
      console.warn('[PUSH] Verifique se há usuários inscritos nas tabelas push_subscriptions ou expo_push_tokens');
      console.warn('[PUSH] Para verificar tokens no Supabase, execute: SELECT * FROM expo_push_tokens;');
      return;
    }

    console.log(`[PUSH] ✅ Encontrados ${totalSubscribers} subscriber(s)`);
    console.log(`[PUSH] - Web Push: ${subscriptions.length}`);
    console.log(`[PUSH] - Expo Push: ${expoTokens.length}`);

    const sendPromises: Promise<any>[] = [];

    // Enviar para Web Push subscriptions
    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title,
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'takepips-notification',
        requireInteraction: false,
        data: data || {},
      });

      subscriptions.forEach((sub: any) => {
        sendPromises.push(
          (async () => {
            try {
              const subscription: PushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              };

              await webpush.sendNotification(subscription, payload);
              console.log(`[PUSH] ✅ Web Push enviado para: ${sub.endpoint.substring(0, 50)}...`);
            } catch (error: any) {
              console.error(`[PUSH] ❌ Erro ao enviar Web Push para ${sub.endpoint.substring(0, 50)}...:`, error);

              // Se a subscription expirou ou é inválida, remover do banco
              if (error.statusCode === 410 || error.statusCode === 404) {
                console.log(`[PUSH] 🗑️ Removendo subscription inválida: ${sub.endpoint.substring(0, 50)}...`);
                try {
                  await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', sub.endpoint);
                } catch (deleteError) {
                  console.error('[PUSH] Erro ao remover subscription:', deleteError);
                }
              }
            }
          })()
        );
      });
    }

    // Enviar para Expo Push tokens (React Native)
    if (expoTokens && expoTokens.length > 0) {
      console.log(`[PUSH] Preparando ${expoTokens.length} mensagem(ns) para Expo Push...`);
      const messages = expoTokens.map((tokenRow: any) => ({
        to: tokenRow.token,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
      }));

      console.log('[PUSH] Mensagens preparadas:', JSON.stringify(messages, null, 2));

      // Enviar via Expo Push Notification Service
      try {
        console.log('[PUSH] Enviando requisição para Expo Push API...');
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });

        console.log('[PUSH] Status da resposta:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('[PUSH] ❌ Erro ao enviar Expo Push:', errorData);
          console.error('[PUSH] Status:', response.status);
        } else {
          const result = await response.json();
          console.log(`[PUSH] ✅ Expo Push enviado para ${expoTokens.length} dispositivo(s)`);
          console.log('[PUSH] Resultado completo:', JSON.stringify(result, null, 2));
          
          // Verificar se há erros na resposta
          if (result.data && Array.isArray(result.data)) {
            result.data.forEach((receipt: any, index: number) => {
              if (receipt.status === 'error') {
                console.error(`[PUSH] ❌ Erro no token ${index + 1}:`, receipt.message);
              } else {
                console.log(`[PUSH] ✅ Token ${index + 1} enviado com sucesso`);
              }
            });
          }
        }
      } catch (error) {
        console.error('[PUSH] ❌ Erro ao fazer requisição para Expo Push:', error);
        if (error instanceof Error) {
          console.error('[PUSH] Mensagem de erro:', error.message);
          console.error('[PUSH] Stack:', error.stack);
        }
      }
    } else {
      console.warn('[PUSH] ⚠️ Nenhum token Expo encontrado para enviar notificação');
    }

    await Promise.allSettled(sendPromises);
    console.log('[PUSH] ✅ Processo de envio concluído');
  } catch (error) {
    console.error('[PUSH] ❌ Erro no bloco try/catch:', error);
    if (error instanceof Error) {
      console.error('[PUSH] Mensagem de erro:', error.message);
      console.error('[PUSH] Stack trace:', error.stack);
    } else {
      console.error('[PUSH] Erro completo:', JSON.stringify(error, null, 2));
    }
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
  take1: number,
  changedFields?: string[]
): Promise<void> {
  console.log('[PUSH] notifySignalDataUpdate chamado:', { signalType, symbol, entry, stopLoss, take1, changedFields });

  const emoji = signalType === 'BUY' ? '📈' : '📉';
  const title = `🔄 ${emoji} Sinal ${signalType} Atualizado - ${symbol}`;

  // Montar mensagem mostrando o que foi alterado
  let body = '';

  if (changedFields && changedFields.length > 0) {
    // Traduzir nomes dos campos
    const fieldNames: Record<string, string> = {
      entry: 'Entrada',
      stopLoss: 'Stop Loss',
      take1: 'Take 1',
      take2: 'Take 2',
      take3: 'Take 3',
      stopTicks: 'Stop Ticks',
    };

    // Montar lista de campos alterados
    const changedFieldsText = changedFields.map(field => fieldNames[field] || field).join(', ');
    body = `Alterado: ${changedFieldsText}\nEntry: ${entry.toFixed(2)} | Stop: ${stopLoss.toFixed(2)} | Take1: ${take1.toFixed(2)}`;
  } else {
    // Fallback se não tiver changedFields
    body = `Entry: ${entry.toFixed(2)} | Stop: ${stopLoss.toFixed(2)} | Take1: ${take1.toFixed(2)}`;
  }

  console.log('[PUSH] Preparando notificação de atualização:', { title, body });

  await sendPushNotification(title, body, {
    signalType,
    symbol,
    entry,
    stopLoss,
    take1,
    changedFields: changedFields || [],
    event: 'SIGNAL_DATA_UPDATE',
    timestamp: new Date().toISOString(),
  });

  console.log('[PUSH] notifySignalDataUpdate concluído');
}

