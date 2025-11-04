import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalRepositorySupabase } from '../../src/infrastructure/repositories/SignalRepositorySupabase';

/**
 * API Route para obter estatísticas de sinais
 * Compatível com Vercel Serverless Functions
 *
 * Endpoint: GET /api/signals/stats?period=today|30days|90days
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tratar requisição OPTIONS (preflight)
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

    // Obter período da query
    const period = (req.query.period as string) || 'all';

    const signalRepository = new SignalRepositorySupabase();

    // Se requisitou todos os períodos
    if (period === 'all') {
      const [today, last30Days, last90Days] = await Promise.all([
        signalRepository.getStats(1),
        signalRepository.getStats(30),
        signalRepository.getStats(90),
      ]);

      res.status(200).json({
        success: true,
        data: {
          today,
          last30Days,
          last90Days,
        },
      });
      return;
    }

    // Se requisitou um período específico
    let days = 1;
    if (period === '30days') days = 30;
    else if (period === '90days') days = 90;

    const stats = await signalRepository.getStats(days);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[ERROR] Erro ao buscar estatísticas:', {
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
