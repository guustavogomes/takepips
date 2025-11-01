import { neon } from '@neondatabase/serverless';
import { validateEnv } from '../../shared/config/env';

/**
 * Cria conexão com o banco de dados Neon
 * Singleton pattern para reutilizar conexões
 */
class DatabaseConnection {
  private sql: ReturnType<typeof neon> | null = null;

  /**
   * Obtém a conexão com o banco de dados
   * @returns Instância do cliente Neon
   */
  getConnection() {
    if (!this.sql) {
      // Validar variáveis de ambiente
      validateEnv();
      
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        throw new Error('DATABASE_URL não está configurada nas variáveis de ambiente');
      }

      this.sql = neon(databaseUrl);
    }

    return this.sql;
  }

  /**
   * Fecha a conexão (útil para testes)
   */
  close() {
    this.sql = null;
  }
}

export const dbConnection = new DatabaseConnection();

