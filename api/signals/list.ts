import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalRepositorySupabase } from '../../src/infrastructure/repositories/SignalRepositorySupabase';

/**
 * API Route para listar sinais
 * Compatível com Vercel Serverless Functions
 * 
 * Endpoint: GET /api/signals/list
 * Query params: ?limit=100&offset=0&symbol=BTCUSD
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

    // Obter parâmetros de query
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const symbol = req.query.symbol as string | undefined;

    const signalRepository = new SignalRepositorySupabase();
    
    // Buscar sinais
    let signals;
    if (symbol) {
      signals = await signalRepository.findBySymbol(symbol, limit);
    } else {
      signals = await signalRepository.findAll(limit, offset);
    }

    // Formatar resposta
    const response = {
      success: true,
      data: signals.map(signal => ({
        id: signal.id,
        name: signal.name,
        type: signal.type,
        symbol: signal.symbol,
        entry: signal.entry,
        stopLoss: signal.stopLoss,
        take1: signal.take1,
        take2: signal.take2,
        take3: signal.take3,
        stopTicks: signal.stopTicks,
        status: signal.status,
        time: signal.time.toISOString(),
        stopHitAt: signal.stopHitAt?.toISOString(),
        take1HitAt: signal.take1HitAt?.toISOString(),
        take2HitAt: signal.take2HitAt?.toISOString(),
        take3HitAt: signal.take3HitAt?.toISOString(),
        stopHitPrice: signal.stopHitPrice,
        take1HitPrice: signal.take1HitPrice,
        take2HitPrice: signal.take2HitPrice,
        take3HitPrice: signal.take3HitPrice,
        createdAt: signal.createdAt.toISOString(),
        updatedAt: signal.updatedAt.toISOString(),
      })),
      pagination: {
        limit,
        offset,
        total: signals.length,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[ERROR] Erro ao listar sinais:', {
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

