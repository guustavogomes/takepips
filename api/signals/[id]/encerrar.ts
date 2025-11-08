import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalRepositorySupabase } from '../../../src/infrastructure/repositories/SignalRepositorySupabase';
import { notifySignalCancelled } from '../../../src/shared/utils/pushNotifications';

/**
 * API Route para cancelar um sinal manualmente
 * Compatível com Vercel Serverless Functions
 *
 * Endpoint: POST /api/signals/[id]/encerrar
 * 
 * IMPORTANTE: Este endpoint agora marca o sinal como CANCELADO
 * ENCERRADO é usado apenas quando o Take 3 é atingido
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

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          message: 'ID do sinal é obrigatório',
          code: 'MISSING_ID',
        },
      });
      return;
    }

    const signalRepository = new SignalRepositorySupabase();
    
    // Verificar se o sinal existe
    const signal = await signalRepository.findById(id);
    if (!signal) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Sinal não encontrado',
          code: 'SIGNAL_NOT_FOUND',
        },
      });
      return;
    }

    // Atualizar status para CANCELADO usando o repositório
    // Usar hitPrice = 0 já que não é necessário para CANCELADO
    const updatedSignal = await signalRepository.updateStatus(id, 'CANCELADO', 0);

    console.log('[SIGNAL] Sinal cancelado, enviando notificação push...', {
      id: updatedSignal.id,
      type: updatedSignal.type,
      symbol: updatedSignal.symbol,
    });

    // Enviar notificação push para usuários
    try {
      await notifySignalCancelled(
        updatedSignal.type,
        updatedSignal.symbol,
        'Sinal cancelado manualmente'
      );
      console.log('[PUSH] ✅ Notificação de cancelamento enviada com sucesso');
    } catch (error) {
      console.error('[PUSH] ❌ Erro ao enviar notificação de cancelamento:', error);
      console.error('[PUSH] Stack:', error instanceof Error ? error.stack : 'N/A');
      // Não bloquear a resposta em caso de erro na notificação
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedSignal.id,
        status: updatedSignal.status,
        updatedAt: updatedSignal.updatedAt.toISOString(),
      },
      message: 'Sinal cancelado com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[ERROR] Erro ao cancelar sinal:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
