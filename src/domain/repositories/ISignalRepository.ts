import { Signal, CreateSignalData, SignalStatus } from '../entities/Signal';

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

  /**
   * Atualiza o status de um sinal (quando atinge stop loss ou take)
   * @param id ID do sinal
   * @param status Novo status (STOP_LOSS, TAKE1, TAKE2, TAKE3)
   * @param hitPrice Preço exato quando o nível foi atingido
   * @returns Promise com o sinal atualizado
   */
  updateStatus(id: string, status: SignalStatus, hitPrice: number): Promise<Signal>;
}

