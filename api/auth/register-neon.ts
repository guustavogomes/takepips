import { VercelRequest, VercelResponse } from '@vercel/node';
import { StackServerApp } from '@stackframe/js';
import { z } from 'zod';

/**
 * API Route para registrar novo usuário usando Neon Auth
 * 
 * Endpoint: POST /api/auth/register
 * 
 * Documentação: https://neon.com/docs/neon-auth/quick-start/nextjs
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

    // Inicializar Neon Auth
    const stackServerApp = new StackServerApp({
      projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      tokenStore: 'database',
    });

    // Criar usuário usando Neon Auth
    // Nota: A API pode variar, ajuste conforme documentação oficial
    const user = await stackServerApp.createUser({
      primaryEmail: email,
      primaryEmailVerified: false,
      displayName: fullName,
      password: password,
    });

    // Criar sessão para o usuário
    const session = await stackServerApp.createSession({
      userId: user.id,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.displayName || fullName,
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
    
    console.error('[ERROR] Erro ao registrar usuário:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    // Tratar erros específicos do Neon Auth
    if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('email')) {
      res.status(409).json({
        success: false,
        error: {
          message: 'Email já está em uso',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}