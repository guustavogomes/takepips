import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalRepository } from '../../../src/infrastructure/repositories/SignalRepository';
import { neon } from '@neondatabase/serverless';

/**
 * API Route para encerrar um sinal (parar monitoramento)
 * Compatível com Vercel Serverless Functions
 *
 * Endpoint: POST /api/signals/[id]/encerrar
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

    const signalRepository = new SignalRepository();
    
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

    // Atualizar status para ENCERRADO usando SQL direto (não precisa de hitPrice)
    const sql = neon(process.env.DATABASE_URL);
    const now = new Date();
    
    const result = await sql`
      UPDATE signals 
      SET status = 'ENCERRADO', 
          updated_at = ${now.toISOString()}
      WHERE id = ${id}
      RETURNING *
    ` as Record<string, any>[];

    if (!result || result.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Sinal não encontrado ou falha ao atualizar',
          code: 'UPDATE_FAILED',
        },
      });
      return;
    }

    const updatedSignal = await signalRepository.findById(id);
    if (!updatedSignal) {
      throw new Error('Erro ao buscar sinal atualizado');
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedSignal.id,
        status: updatedSignal.status,
        updatedAt: updatedSignal.updatedAt.toISOString(),
      },
      message: 'Sinal encerrado com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[ERROR] Erro ao encerrar sinal:', {
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

