import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

/**
 * API Route para registrar novo usuário usando Supabase Auth
 * 
 * Endpoint: POST /api/auth/register
 * 
 * Documentação: https://supabase.com/docs/guides/auth
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

    // Verificar se Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[ERROR] Supabase não está configurado');
      res.status(500).json({
        success: false,
        error: {
          message: 'Supabase não está configurado. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
          code: 'SUPABASE_NOT_CONFIGURED',
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

    // Criar cliente Supabase com service role (tem acesso completo)
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

    // Criar usuário usando Supabase Auth (signUp)
    // Usar service role permite criar usuário e confirmar email automaticamente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined, // Não precisa de redirect
      },
    });

    if (authError) {
      console.error('[ERROR] Erro ao criar usuário:', authError);
      
      // Tratar erros específicos
      if (authError.message.includes('already registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
        res.status(409).json({
          success: false,
          error: {
            message: 'Email já está em uso',
            code: 'EMAIL_ALREADY_EXISTS',
          },
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: {
          message: authError.message || 'Erro ao criar usuário',
          code: 'AUTH_ERROR',
        },
      });
      return;
    }

    if (!authData.user) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Usuário criado mas dados não retornados',
          code: 'USER_CREATION_ERROR',
        },
      });
      return;
    }

    // Confirmar email automaticamente usando admin API (se necessário)
    // Se o email já estiver confirmado, a sessão já vem no signUp
    if (authData.session) {
      // Sessão já criada, retornar sucesso
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: authData.user.id,
            fullName: authData.user.user_metadata?.full_name || fullName,
            email: authData.user.email!,
            createdAt: authData.user.created_at,
            updatedAt: authData.user.updated_at,
          },
          token: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
        },
      });
      return;
    }

    // Se não houver sessão (email não confirmado), fazer login para criar sessão
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.error('[ERROR] Erro ao criar sessão após registro:', signInError);
      // Mesmo sem sessão, o usuário foi criado
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: authData.user.id,
            fullName: authData.user.user_metadata?.full_name || fullName,
            email: authData.user.email!,
            createdAt: authData.user.created_at,
            updatedAt: authData.user.updated_at,
          },
          token: null,
          message: 'Usuário criado com sucesso. Verifique seu email para confirmar a conta.',
        },
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          fullName: authData.user.user_metadata?.full_name || fullName,
          email: authData.user.email!,
          createdAt: authData.user.created_at,
          updatedAt: authData.user.updated_at,
        },
        token: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
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
