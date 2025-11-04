import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../../shared/config/env';

/**
 * Cria conexão com o banco de dados Supabase
 * Singleton pattern para reutilizar conexões
 */
class SupabaseConnection {
  private supabase: ReturnType<typeof createClient> | null = null;

  /**
   * Obtém a conexão com o banco de dados Supabase
   * @returns Instância do cliente Supabase
   */
  getConnection() {
    if (!this.supabase) {
      // Validar variáveis de ambiente
      validateEnv();
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configuradas nas variáveis de ambiente');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    return this.supabase;
  }

  /**
   * Obtém o cliente SQL direto (para queries SQL puras)
   * @returns Cliente SQL do Supabase
   */
  getSQLClient() {
    const client = this.getConnection();
    // Retorna o cliente para queries SQL diretas
    return client;
  }

  /**
   * Fecha a conexão (útil para testes)
   */
  close() {
    this.supabase = null;
  }
}

export const supabaseConnection = new SupabaseConnection();

// Para compatibilidade com código existente que usa `dbConnection`
export const dbConnection = {
  getConnection: () => supabaseConnection.getConnection(),
  close: () => supabaseConnection.close(),
};
