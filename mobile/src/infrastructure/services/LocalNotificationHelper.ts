/**
 * Helper para notificações locais (não requer Firebase/EAS)
 *
 * Use este helper durante o desenvolvimento para testar notificações
 * sem precisar configurar Firebase ou EAS Build
 */

import * as Notifications from 'expo-notifications';

export interface LocalNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  delaySeconds?: number;
}

/**
 * Envia uma notificação local (não requer conexão com servidor)
 */
export async function sendLocalNotification(
  options: LocalNotificationOptions
): Promise<string> {
  const { title, body, data = {}, delaySeconds = 0 } = options;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });

    console.log('[LocalNotification] Notificação agendada:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[LocalNotification] Erro ao agendar notificação:', error);
    throw error;
  }
}

/**
 * Envia notificação de sinal de trading (helper específico)
 */
export async function sendTradingSignalNotification(signal: {
  pair: string;
  action: 'BUY' | 'SELL';
  price: number;
  takeProfit?: number;
  stopLoss?: number;
}): Promise<string> {
  const emoji = signal.action === 'BUY' ? '📈' : '📉';

  const tpText = signal.takeProfit ? signal.takeProfit.toFixed(2) : 'N/A';
  const slText = signal.stopLoss ? signal.stopLoss.toFixed(2) : 'N/A';

  return sendLocalNotification({
    title: `${emoji} Novo Sinal: ${signal.pair}`,
    body: `${signal.action} em ${signal.price.toFixed(2)}\nTP: ${tpText} | SL: ${slText}`,
    data: {
      type: 'trading_signal',
      signal,
    },
  });
}

/**
 * Exemplo de uso para testes
 */
export async function sendTestNotification(): Promise<string> {
  return sendTradingSignalNotification({
    pair: 'GOLD (XAU/USD)',
    action: 'BUY',
    price: 2050.00,
    takeProfit: 2055.00,
    stopLoss: 2047.00,
  });
}
