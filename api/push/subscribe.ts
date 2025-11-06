import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route para registrar subscription de push notifications
 * 
 * Endpoint: POST /api/push/subscribe
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

    // Suporta tanto Web Push (subscription) quanto Expo Push (token)
    const { subscription, token, platform, deviceId } = req.body;

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

    // Se for token Expo (React Native)
    if (token) {
      // Inserir ou atualizar token Expo usando Supabase
      const { error: upsertError } = await supabase
        .from('expo_push_tokens')
        .upsert(
          {
            token,
            platform: platform || 'unknown',
            device_id: deviceId || 'unknown',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'token',
          }
        );

      if (upsertError) {
        console.error('[ERROR] Erro ao salvar token Expo:', upsertError);
        throw upsertError;
      }

      console.log('[API] ✅ Expo Push Token salvo com sucesso');
      console.log('[API] Token:', token.substring(0, 30) + '...');
      console.log('[API] Platform:', platform || 'unknown');
      console.log('[API] Device ID:', deviceId || 'unknown');
      
      // Verificar se foi realmente salvo
      const { data: savedToken, error: checkError } = await supabase
        .from('expo_push_tokens')
        .select('*')
        .eq('token', token)
        .single();
      
      if (checkError) {
        console.error('[API] ⚠️ Erro ao verificar token salvo:', checkError);
      } else {
        console.log('[API] ✅ Token verificado no banco de dados:', savedToken);
      }
      
      res.status(200).json({
        success: true,
        message: 'Token registrado com sucesso',
      });
      return;
    }

    // Se for Web Push subscription (PWA)
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Subscription ou token inválido. É necessário subscription (endpoint e keys) ou token (Expo).',
          code: 'INVALID_SUBSCRIPTION',
        },
      });
      return;
    }

    // Inserir ou atualizar subscription usando Supabase
    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'endpoint',
        }
      );

    if (upsertError) {
      console.error('[ERROR] Erro ao salvar subscription:', upsertError);
      throw upsertError;
    }

    console.log('✅ Subscription salva:', subscription.endpoint);

    res.status(200).json({
      success: true,
      message: 'Subscription registrada com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[ERROR] Erro ao registrar subscription:', {
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

