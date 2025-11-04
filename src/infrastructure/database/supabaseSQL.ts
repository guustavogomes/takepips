/**
 * Helper para executar SQL direto com Supabase
 * 
 * Mantém compatibilidade com código que usa SQL template literals do Neon
 * Adapta para Supabase usando RPC ou query builder
 */

import { dbConnection } from './connection';

/**
 * Executa uma query SQL direta usando Supabase
 * 
 * @param query SQL query com placeholders $1, $2, etc.
 * @param params Array de parâmetros
 * @returns Resultado da query
 */
export async function executeSQL<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const supabase = dbConnection.getConnection();

  // Para queries simples, usar Supabase PostgREST quando possível
  // Para queries complexas, usar RPC ou SQL direto
  
  // Detectar tipo de query
  const queryUpper = query.trim().toUpperCase();
  
  if (queryUpper.startsWith('SELECT')) {
    // SELECT queries - usar .from() quando possível ou RPC
    return executeSelectQuery(supabase, query, params);
  } else if (queryUpper.startsWith('INSERT')) {
    // INSERT queries - usar .insert() quando possível ou RPC
    return executeInsertQuery(supabase, query, params);
  } else if (queryUpper.startsWith('UPDATE')) {
    // UPDATE queries - usar .update() quando possível ou RPC
    return executeUpdateQuery(supabase, query, params);
  } else if (queryUpper.startsWith('DELETE')) {
    // DELETE queries - usar .delete() quando possível ou RPC
    return executeDeleteQuery(supabase, query, params);
  } else {
    // Para outras queries, usar RPC direto
    // Criar função temporária no Supabase ou usar SQL direto
    return executeRawQuery(supabase, query, params);
  }
}

/**
 * Executa SELECT queries usando Supabase
 */
async function executeSelectQuery<T>(
  supabase: ReturnType<typeof dbConnection.getConnection>,
  query: string,
  params: any[]
): Promise<T[]> {
  // Para SELECT simples, usar .from()
  // Para SELECT complexo, usar RPC
  const result = await supabase.rpc('execute_sql', {
    query_text: query,
    query_params: params,
  }).catch(async () => {
    // Se RPC não existir, usar SQL direto via PostgREST
    // Fallback: executar query direta
    return { data: null, error: new Error('RPC não disponível') };
  });

  if (result.error) {
    // Fallback: tentar executar via query builder simplificado
    // Para queries complexas, será necessário criar RPC no Supabase
    console.warn('[SupabaseSQL] RPC não disponível, tentando fallback');
    throw new Error(`Query não suportada sem RPC: ${result.error.message}`);
  }

  return result.data || [];
}

/**
 * Executa INSERT queries usando Supabase
 */
async function executeInsertQuery<T>(
  supabase: ReturnType<typeof dbConnection.getConnection>,
  query: string,
  params: any[]
): Promise<T[]> {
  // Similar ao SELECT, mas para INSERT
  const result = await supabase.rpc('execute_sql', {
    query_text: query,
    query_params: params,
  });

  if (result.error) {
    throw new Error(`Erro ao executar INSERT: ${result.error.message}`);
  }

  return result.data || [];
}

/**
 * Executa UPDATE queries usando Supabase
 */
async function executeUpdateQuery<T>(
  supabase: ReturnType<typeof dbConnection.getConnection>,
  query: string,
  params: any[]
): Promise<T[]> {
  const result = await supabase.rpc('execute_sql', {
    query_text: query,
    query_params: params,
  });

  if (result.error) {
    throw new Error(`Erro ao executar UPDATE: ${result.error.message}`);
  }

  return result.data || [];
}

/**
 * Executa DELETE queries usando Supabase
 */
async function executeDeleteQuery<T>(
  supabase: ReturnType<typeof dbConnection.getConnection>,
  query: string,
  params: any[]
): Promise<T[]> {
  const result = await supabase.rpc('execute_sql', {
    query_text: query,
    query_params: params,
  });

  if (result.error) {
    throw new Error(`Erro ao executar DELETE: ${result.error.message}`);
  }

  return result.data || [];
}

/**
 * Executa queries SQL diretas (fallback)
 * 
 * Nota: Supabase não suporta SQL direto sem RPC.
 * Para produção, será necessário criar uma função RPC no Supabase.
 */
async function executeRawQuery<T>(
  supabase: ReturnType<typeof dbConnection.getConnection>,
  query: string,
  params: any[]
): Promise<T[]> {
  // Por enquanto, usar RPC
  const result = await supabase.rpc('execute_sql', {
    query_text: query,
    query_params: params,
  });

  if (result.error) {
    throw new Error(`Erro ao executar query: ${result.error.message}`);
  }

  return result.data || [];
}

/**
 * Wrapper para compatibilidade com código Neon existente
 * 
 * Permite usar `sql(query, params)` como no Neon
 */
export function createSQLWrapper() {
  return async (query: string, params: any[] = []) => {
    return executeSQL(query, params);
  };
}
