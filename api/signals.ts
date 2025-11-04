import { VercelRequest, VercelResponse } from '@vercel/node';
import { SignalController } from '../src/presentation/controllers/SignalController';
import { CreateSignalUseCase } from '../src/application/useCases/CreateSignalUseCase';
import { SignalRepositorySupabase } from '../src/infrastructure/repositories/SignalRepositorySupabase';

/**
 * API Route para receber sinais de trading
 * Compatível com Vercel Serverless Functions
 * 
 * Endpoint: POST /api/signals
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    // Log da requisição
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    
    // Configurar CORS para permitir requisições do MT5
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tratar requisição OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Apenas aceitar POST
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

    // Dependency Injection - criar instâncias seguindo SOLID
    const signalRepository = new SignalRepositorySupabase();
    const createSignalUseCase = new CreateSignalUseCase(signalRepository);
    const signalController = new SignalController(createSignalUseCase);

    // Delegar para o controller
    await signalController.create(req, res);
  } catch (error) {
    // Log detalhado do erro
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[ERROR] Erro não tratado:', {
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

