import { Signal, CreateSignalData } from '../entities/Signal';

/**
 * Interface do repositório de sinais
 * Segue o princípio de Dependency Inversion (SOLID)
 * A aplicação depende de abstrações, não de implementações concretas
 */
export interface ISignalRepository {
  /**
   * Cria um novo sinal no banco de dados
   * @param data Dados do sinal a ser criado
   * @returns Promise com o sinal criado
   */
  create(data: CreateSignalData): Promise<Signal>;

  /**
   * Busca um sinal por ID
   * @param id ID do sinal
   * @returns Promise com o sinal ou null se não encontrado
   */
  findById(id: string): Promise<Signal | null>;

  /**
   * Lista todos os sinais
   * @param limit Limite de resultados
   * @param offset Offset para paginação
   * @returns Promise com array de sinais
   */
  findAll(limit?: number, offset?: number): Promise<Signal[]>;

  /**
   * Busca sinais por símbolo
   * @param symbol Símbolo do ativo
   * @param limit Limite de resultados
   * @returns Promise com array de sinais
   */
  findBySymbol(symbol: string, limit?: number): Promise<Signal[]>;
}

