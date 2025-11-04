import { VercelRequest, VercelResponse } from '@vercel/node';
import { StackServerApp } from '@stackframe/js';
import { z } from 'zod';

/**
 * API Route para fazer login usando Neon Auth
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

    // Verificar se Neon Auth está configurado
    if (!process.env.STACK_SECRET_SERVER_KEY || !process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
      console.error('[ERROR] Neon Auth não está configurado');
      res.status(500).json({
        success: false,
        error: {
          message: 'Neon Auth não está configurado. Configure STACK_SECRET_SERVER_KEY e NEXT_PUBLIC_STACK_PROJECT_ID.',
          code: 'NEON_AUTH_NOT_CONFIGURED',
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

    // Inicializar Neon Auth
    const stackServerApp = new StackServerApp({
      projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      tokenStore: 'database',
    });

    // Buscar usuário por email
    const users = await stackServerApp.listUsers({
      primaryEmail: email,
    });

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

    // Verificar senha usando Neon Auth
    const isValidPassword = await stackServerApp.verifyPassword({
      userId: user.id,
      password: password,
    });

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Email ou senha incorretos',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    // Criar sessão
    const session = await stackServerApp.createSession({
      userId: user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.displayName || user.primaryEmail.split('@')[0],
          email: user.primaryEmail,
          createdAt: user.createdAtMillis ? new Date(user.createdAtMillis).toISOString() : new Date().toISOString(),
          updatedAt: user.updatedAtMillis ? new Date(user.updatedAtMillis).toISOString() : new Date().toISOString(),
        },
        token: session.token,
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