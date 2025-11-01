import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API Route para obter chave pública VAPID
 * 
 * Endpoint: GET /api/push/vapid-public-key
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({
        success: false,
        error: {
          message: 'Método não permitido. Use GET.',
          code: 'METHOD_NOT_ALLOWED',
        },
      });
      return;
    }

    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      res.status(500).json({
        success: false,
        error: {
          message: 'VAPID public key não configurada',
          code: 'CONFIGURATION_ERROR',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        publicKey,
      },
    });
  } catch (error) {
    console.error('[ERROR] Erro ao obter VAPID public key:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

