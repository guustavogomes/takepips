import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * API Route para fazer login
 * 
 * Endpoint: POST /api/auth/login
 */

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    console.log(`[API] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
          message: 'Configuração do servidor incompleta.',
          code: 'CONFIGURATION_ERROR',
        },
      });
      return;
    }

    // Validar dados
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: validationResult.error.errors[0]?.message || 'Dados inválidos',
          code: 'VALIDATION_ERROR',
        },
      });
      return;
    }

    const { email, password } = validationResult.data;

    const sql = neon(process.env.DATABASE_URL);

    // Buscar usuário
    const users = await sql`
      SELECT id, full_name, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;

    if (!users || users.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Email ou senha incorretos',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    const user = users[0];

    // Verificar senha
    const crypto = await import('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password_hash !== passwordHash) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Email ou senha incorretos',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    // Gerar token
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          createdAt: user.created_at.toISOString(),
          updatedAt: user.updated_at.toISOString(),
        },
        token: `Bearer ${token}`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[ERROR] Erro ao fazer login:', {
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
