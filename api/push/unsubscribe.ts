import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route para remover subscription de push notifications
 * 
 * Endpoint: POST /api/push/unsubscribe
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[ERROR] Supabase não está configurado');
      res.status(500).json({
        success: false,
        error: {
          message: 'Configuração do servidor incompleta.',
          code: 'CONFIGURATION_ERROR',
        },
      });
      return;
    }

    const { token, endpoint } = req.body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Se for token Expo
    if (token) {
      const { error } = await supabase
        .from('expo_push_tokens')
        .delete()
        .eq('token', token);

      if (error) {
        console.error('[ERROR] Erro ao remover token:', error);
        throw error;
      }

      console.log('✅ Expo Push Token removido:', token);
      
      res.status(200).json({
        success: true,
        message: 'Token removido com sucesso',
      });
      return;
    }

    // Se for Web Push subscription
    if (!endpoint) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Token ou endpoint é necessário.',
          code: 'INVALID_REQUEST',
        },
      });
      return;
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('[ERROR] Erro ao remover subscription:', error);
      throw error;
    }

    console.log('✅ Subscription removida:', endpoint);

    res.status(200).json({
      success: true,
      message: 'Subscription removida com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[ERROR] Erro ao remover subscription:', {
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
