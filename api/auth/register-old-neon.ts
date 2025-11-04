import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

/**
 * API Route para registrar novo usuário
 * Usa Neon Authentication
 * 
 * Endpoint: POST /api/auth/register
 */

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
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
    const validationResult = registerSchema.safeParse(req.body);
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

    const { fullName, email, password } = validationResult.data;

    const sql = neon(process.env.DATABASE_URL);

    // Criar tabela de usuários se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `.catch(err => {
      console.warn('[AUTH] Tabela users já existe ou erro ao criar:', err.message);
    });

    // Verificar se email já existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser && existingUser.length > 0) {
      res.status(409).json({
        success: false,
        error: {
          message: 'Email já está em uso',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      });
      return;
    }

    // Hash da senha (usando bcrypt simples - em produção, use bcrypt ou similar)
    // Por enquanto, vamos usar uma abordagem simples. Em produção, use bcrypt ou Neon Auth
    const crypto = await import('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Inserir usuário
    const result = await sql`
      INSERT INTO users (full_name, email, password_hash)
      VALUES (${fullName}, ${email}, ${passwordHash})
      RETURNING id, full_name, email, created_at, updated_at
    `;

    const user = result[0];

    // Gerar token JWT simples (em produção, use uma biblioteca JWT adequada)
    // Por enquanto, vamos usar um token simples baseado no ID
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    res.status(201).json({
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
    
    console.error('[ERROR] Erro ao registrar usuário:', {
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
