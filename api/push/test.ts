import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendPushNotification } from '../../src/shared/utils/pushNotifications';

/**
 * API Route para enviar notificação de teste
 *
 * Endpoint: POST /api/push/test
 *
 * Body (opcional):
 * {
 *   "title": "Título da notificação",
 *   "body": "Corpo da notificação"
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: {
          message: 'Método não permitido. Use POST.',
          code: 'METHOD_NOT_ALLOWED',
        },
      });
      return;
    }

    const { title, body } = req.body || {};

    const notificationTitle = title || '🔔 Teste de Notificação - TakePips';
    const notificationBody = body || 'Esta é uma notificação de teste! Se você viu isso, as notificações estão funcionando! 🎉';

    console.log('[TEST] Enviando notificação de teste...');
    console.log('[TEST] Title:', notificationTitle);
    console.log('[TEST] Body:', notificationBody);

    await sendPushNotification(notificationTitle, notificationBody, {
      event: 'TEST',
      timestamp: new Date().toISOString(),
    });

    console.log('[TEST] ✅ Notificação de teste enviada com sucesso!');

    res.status(200).json({
      success: true,
      message: 'Notificação de teste enviada com sucesso!',
      data: {
        title: notificationTitle,
        body: notificationBody,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[ERROR] Erro ao enviar notificação de teste:', errorMessage);
    console.error('[ERROR] Stack:', error instanceof Error ? error.stack : 'N/A');

    res.status(500).json({
      success: false,
      error: {
        message: 'Erro ao enviar notificação de teste',
        details: errorMessage,
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
