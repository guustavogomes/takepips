import { VercelRequest, VercelResponse } from '@vercel/node';
import { AppError } from '../errors/AppError';
import { ValidationError } from '../errors/AppError';
import { ApiResponse } from '../types/ApiResponse';
import { ZodError } from 'zod';

/**
 * Trata erros e retorna resposta apropriada
 * @param error Erro capturado
 * @param res Response do Vercel
 */
export function handleError(error: unknown, res: VercelResponse): void {
  console.error('Error:', error);

  // Erro de validação do Zod
  if (error instanceof ZodError) {
    const validationError: ApiResponse = {
      success: false,
      error: {
        message: error.errors.map((e) => e.message).join(', '),
        code: 'VALIDATION_ERROR',
      },
    };
    res.status(400).json(validationError);
    return;
  }

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    const apiError: ApiResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };
    res.status(error.statusCode).json(apiError);
    return;
  }

  // Erro genérico
  const internalError: ApiResponse = {
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      code: 'INTERNAL_SERVER_ERROR',
    },
  };
  res.status(500).json(internalError);
}

