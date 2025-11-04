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
 * Migrado para Supabase - agora valida variáveis do Supabase
 */
export function validateEnv(): void {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL não está configurada. ' +
      'Configure NEXT_PUBLIC_SUPABASE_URL nas variáveis de ambiente'
    );
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não está configurada. ' +
      'Configure SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente'
    );
  }
}

