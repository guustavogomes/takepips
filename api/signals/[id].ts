import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalRepositorySupabase } from '../../src/infrastructure/repositories/SignalRepositorySupabase';
import { notifySignalDataUpdate } from '../../src/shared/utils/pushNotifications';

/**
 * API Route para atualizar dados de um sinal existente
 * Compatível com Vercel Serverless Functions
 *
 * Endpoint: PATCH /api/signals/[id]
 * Body: { entry?, stopLoss?, take1?, take2?, take3?, stopTicks? }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'PATCH' && req.method !== 'PUT') {
      res.status(405).json({
        success: false,
        error: {
          message: 'Método não permitido. Use PATCH ou PUT.',
          code: 'METHOD_NOT_ALLOWED',
        },
      });
      return;
    }

    if (!process.env.DATABASE_URL) {
      console.error('[ERROR] DATABASE_URL não está configurada');
      res.status(500).json({
        success: false,
        error: {
          message: 'Configuração do servidor incompleta. Contate o administrador.',
          code: 'CONFIGURATION_ERROR',
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

    const { entry, stopLoss, take1, take2, take3, stopTicks } = req.body;

    // Validar que pelo menos um campo foi fornecido
    if (
      entry === undefined &&
      stopLoss === undefined &&
      take1 === undefined &&
      take2 === undefined &&
      take3 === undefined &&
      stopTicks === undefined
    ) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Pelo menos um campo deve ser fornecido para atualização',
          code: 'NO_FIELDS_PROVIDED',
        },
      });
      return;
    }

    const signalRepository = new SignalRepositorySupabase();
    
    // Buscar sinal antes de atualizar para obter dados completos
    const signalBefore = await signalRepository.findById(id);
    if (!signalBefore) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Sinal não encontrado',
          code: 'SIGNAL_NOT_FOUND',
        },
      });
      return;
    }

    // Detectar quais campos foram realmente alterados
    const changedFields: string[] = [];
    
    if (entry !== undefined && Math.abs(entry - signalBefore.entry) > 0.0001) {
      changedFields.push('entry');
    }
    if (stopLoss !== undefined && Math.abs(stopLoss - signalBefore.stopLoss) > 0.0001) {
      changedFields.push('stopLoss');
    }
    if (take1 !== undefined && Math.abs(take1 - signalBefore.take1) > 0.0001) {
      changedFields.push('take1');
    }
    if (take2 !== undefined && Math.abs(take2 - signalBefore.take2) > 0.0001) {
      changedFields.push('take2');
    }
    if (take3 !== undefined && Math.abs(take3 - signalBefore.take3) > 0.0001) {
      changedFields.push('take3');
    }
    if (stopTicks !== undefined && stopTicks !== signalBefore.stopTicks) {
      changedFields.push('stopTicks');
    }

    const updatedSignal = await signalRepository.update(id, {
      entry,
      stopLoss,
      take1,
      take2,
      take3,
      stopTicks,
    });

    // Enviar notificação push quando sinal é atualizado (não bloqueia a resposta)
    console.log('[SIGNAL] Sinal atualizado, enviando notificação push...', {
      id: updatedSignal.id,
      type: updatedSignal.type,
      symbol: updatedSignal.symbol
    });
    
    notifySignalDataUpdate(
      updatedSignal.type,
      updatedSignal.symbol,
      updatedSignal.entry,
      updatedSignal.stopLoss,
      updatedSignal.take1
    )
      .then(() => {
        console.log('[PUSH] ✅ Notificação de atualização de sinal enviada com sucesso');
      })
      .catch(error => {
        console.error('[PUSH] ❌ Erro ao enviar notificação de atualização:', error);
        console.error('[PUSH] Stack:', error instanceof Error ? error.stack : 'N/A');
      });

    res.status(200).json({
      success: true,
      data: {
        id: updatedSignal.id,
        entry: updatedSignal.entry,
        stopLoss: updatedSignal.stopLoss,
        take1: updatedSignal.take1,
        take2: updatedSignal.take2,
        take3: updatedSignal.take3,
        stopTicks: updatedSignal.stopTicks,
        updatedAt: updatedSignal.updatedAt.toISOString(),
        changedFields: changedFields, // Campos que foram realmente alterados
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[ERROR] Erro ao atualizar sinal:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    if (errorMessage.includes('não encontrado')) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Sinal não encontrado',
          code: 'SIGNAL_NOT_FOUND',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

