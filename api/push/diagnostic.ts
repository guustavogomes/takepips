import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route de diagnóstico para verificar o estado do sistema de notificações
 * 
 * Endpoint: GET /api/push/diagnostic
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
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

    const diagnostic: any = {
      timestamp: new Date().toISOString(),
      vapid: {
        publicKey: process.env.VAPID_PUBLIC_KEY ? '✅ Configurada' : '❌ Não configurada',
        privateKey: process.env.VAPID_PRIVATE_KEY ? '✅ Configurada' : '❌ Não configurada',
        subject: process.env.VAPID_SUBJECT || 'Não configurada',
      },
      database: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não configurada',
      },
      subscriptions: {
        count: 0,
        error: null,
      },
    };

    // Verificar subscriptions no banco
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
        
        // Contar subscriptions Web Push
        const { count: webPushCount } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true });
        
        // Contar tokens Expo Push
        const { count: expoCount } = await supabase
          .from('expo_push_tokens')
          .select('*', { count: 'exact', head: true });
        
        diagnostic.subscriptions.count = (webPushCount || 0) + (expoCount || 0);
        diagnostic.subscriptions.webPush = webPushCount || 0;
        diagnostic.subscriptions.expoPush = expoCount || 0;
        
        // Listar subscriptions recentes (Web Push)
        const { data: recentWebPush } = await supabase
          .from('push_subscriptions')
          .select('endpoint, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        // Listar tokens recentes (Expo Push)
        const { data: recentExpo } = await supabase
          .from('expo_push_tokens')
          .select('token, platform, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(5);
        
        diagnostic.subscriptions.recent = {
          webPush: recentWebPush || [],
          expoPush: recentExpo || [],
        };
      } catch (error: any) {
        diagnostic.subscriptions.error = error.message;
        console.error('[DIAGNOSTIC] Erro ao verificar subscriptions:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: diagnostic,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[ERROR] Erro no diagnóstico:', errorMessage);

    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

