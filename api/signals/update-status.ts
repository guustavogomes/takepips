import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalRepositorySupabase } from '../../src/infrastructure/repositories/SignalRepositorySupabase';
import { SignalStatus } from '../../src/domain/entities/Signal';
import { notifySignalUpdate, notifyEntryHit } from '../../src/shared/utils/pushNotifications';

/**
 * API Route para atualizar status de sinal
 * Compatível com Vercel Serverless Functions
 * 
 * Endpoint: PATCH /api/signals/update-status
 * Body: { id: string, status: 'STOP_LOSS' | 'TAKE1' | 'TAKE2' | 'TAKE3', hitPrice: number }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    // Log da requisição
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tratar requisição OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Aceitar PATCH ou POST (alguns clientes HTTP não suportam PATCH bem)
    if (req.method !== 'PATCH' && req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: {
          message: 'Método não permitido. Use PATCH ou POST.',
          code: 'METHOD_NOT_ALLOWED',
        },
      });
      return;
    }

    // Verificar variáveis de ambiente
    // Verificar se Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[ERROR] Supabase não está configurado');
      res.status(500).json({
        success: false,
        error: {
          message: 'Configuração do servidor incompleta. Supabase não configurado.',
          code: 'CONFIGURATION_ERROR',
        },
      });
      return;
    }

    // Validar dados da requisição
    const { id, status, hitPrice } = req.body;

    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          message: 'Campo "id" é obrigatório e deve ser uma string',
          code: 'MISSING_ID',
        },
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Campo "status" é obrigatório',
          code: 'MISSING_STATUS',
        },
      });
      return;
    }

    // hitPrice é opcional para EM_OPERACAO, mas obrigatório para outros status

    // Validar status
    const validStatuses: SignalStatus[] = ['EM_OPERACAO', 'STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          message: `Status inválido. Deve ser um de: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
        },
      });
      return;
    }
    
    // Para EM_OPERACAO, hitPrice é opcional (pode ser 0 ou o preço de entrada)
    if (status !== 'EM_OPERACAO' && (typeof hitPrice !== 'number' || hitPrice <= 0)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Campo "hitPrice" é obrigatório e deve ser um número positivo para este status',
          code: 'INVALID_HIT_PRICE',
        },
      });
      return;
    }

    // Atualizar status no banco
    const signalRepository = new SignalRepositorySupabase();
    // Para EM_OPERACAO, usar hitPrice se fornecido, senão usar 0 (não será usado no repositório)
    const finalHitPrice = status === 'EM_OPERACAO' ? (hitPrice || 0) : hitPrice;
    const updatedSignal = await signalRepository.updateStatus(id, status, finalHitPrice);

    // Enviar notificação push
    // IMPORTANTE: Usar await para garantir que a função complete antes de retornar
    // No Vercel, funções assíncronas sem await podem ser interrompidas após retornar a resposta
    try {
      // Se for EM_OPERACAO, usar função específica para entrada atingida
      if (status === 'EM_OPERACAO') {
        const entryPrice = hitPrice || updatedSignal.entry;
        await notifyEntryHit(updatedSignal.type, updatedSignal.symbol, entryPrice);
        console.log('[PUSH] ✅ Notificação de entrada enviada com sucesso');
      } else {
        // Se for TAKE3, o status no banco será ENCERRADO, mas a notificação ainda mostra TAKE3
        await notifySignalUpdate(updatedSignal.type, updatedSignal.symbol, status, hitPrice);
        console.log('[PUSH] ✅ Notificação de atualização enviada com sucesso');
      }
    } catch (error) {
      console.error('[PUSH] ❌ Erro ao enviar notificação (não crítico):', error);
      // Não bloquear a resposta em caso de erro na notificação
    }

    // Log quando Take 3 encerra automaticamente
    if (status === 'TAKE3') {
      console.log(`[SIGNAL] Take 3 atingido - Sinal ${id} automaticamente encerrado`);
    }

    // Retornar resposta de sucesso
    res.status(200).json({
      success: true,
      data: {
        id: updatedSignal.id,
        status: updatedSignal.status, // Será 'ENCERRADO' se status original foi 'TAKE3'
        stopHitAt: updatedSignal.stopHitAt?.toISOString(),
        take1HitAt: updatedSignal.take1HitAt?.toISOString(),
        take2HitAt: updatedSignal.take2HitAt?.toISOString(),
        take3HitAt: updatedSignal.take3HitAt?.toISOString(),
        stopHitPrice: updatedSignal.stopHitPrice,
        take1HitPrice: updatedSignal.take1HitPrice,
        take2HitPrice: updatedSignal.take2HitPrice,
        take3HitPrice: updatedSignal.take3HitPrice,
        updatedAt: updatedSignal.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    // Log detalhado do erro
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[ERROR] Erro ao atualizar status:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    // Verificar se é erro de "não encontrado"
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

