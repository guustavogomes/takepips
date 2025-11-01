/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR');
  }
}

/**
 * Erro de recurso não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado', code?: string) {
    super(message, 404, code || 'NOT_FOUND');
  }
}

/**
 * Erro interno do servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message = 'Erro interno do servidor', code?: string) {
    super(message, 500, code || 'INTERNAL_SERVER_ERROR');
  }
}

