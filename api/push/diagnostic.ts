import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

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
        url: process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada',
      },
      subscriptions: {
        count: 0,
        error: null,
      },
    };

    // Verificar subscriptions no banco
    if (process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Verificar se a tabela existe
        const tableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'push_subscriptions'
          );
        `;

        const tableExists = tableCheck[0]?.exists || false;

        if (!tableExists) {
          diagnostic.subscriptions.error = 'Tabela push_subscriptions não existe. Execute a migration.';
          diagnostic.subscriptions.tableExists = false;
        } else {
          diagnostic.subscriptions.tableExists = true;
          
          // Contar subscriptions
          const countResult = await sql`
            SELECT COUNT(*) as count FROM push_subscriptions
          `;
          
          diagnostic.subscriptions.count = parseInt(countResult[0]?.count || '0', 10);
          
          // Listar subscriptions recentes
          const recentSubs = await sql`
            SELECT 
              LEFT(endpoint, 50) as endpoint_preview,
              created_at,
              updated_at
            FROM push_subscriptions
            ORDER BY created_at DESC
            LIMIT 5
          `;
          
          diagnostic.subscriptions.recent = recentSubs;
        }
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

