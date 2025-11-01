/**
 * Carrega variáveis de ambiente
 * Em desenvolvimento local, usa dotenv
 * Em produção (Vercel), usa process.env diretamente
 */
if (process.env.NODE_ENV !== 'production') {
  try {
    // Tentar carregar dotenv apenas em desenvolvimento
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config();
  } catch {
    // dotenv não está disponível, continuar sem ele
  }
}

/**
 * Valida se as variáveis de ambiente necessárias estão configuradas
 */
export function validateEnv(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não está configurada. ' +
      'Crie um arquivo .env na raiz do projeto com DATABASE_URL=sua_connection_string'
    );
  }
}

