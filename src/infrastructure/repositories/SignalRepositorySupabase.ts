import { ISignalRepository, SignalStats } from '../../domain/repositories/ISignalRepository';
import { Signal, CreateSignalData, SignalStatus } from '../../domain/entities/Signal';
import { dbConnection } from '../database/connection';
import { parseMT5DateTime } from '../../shared/utils/dateUtils';
import { generateUUID } from '../../shared/utils/uuid';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Implementação do repositório de sinais usando Supabase
 * Migrado de Neon para Supabase
 */
export class SignalRepositorySupabase implements ISignalRepository {
  private readonly supabase = dbConnection.getConnection() as unknown as SupabaseClient<any>;

  async create(data: CreateSignalData): Promise<Signal> {
    const id = generateUUID();
    const now = new Date();
    const signalTime = parseMT5DateTime(data.time);

    const signalData = {
      id,
      name: data.name,
      type: data.type,
      symbol: data.symbol,
      entry: data.entry.toString(),
      stop_loss: data.stopLoss.toString(),
      take1: data.take1.toString(),
      take2: data.take2.toString(),
      take3: data.take3.toString(),
      stop_ticks: data.stopTicks,
      time: signalTime.toISOString(),
      sessao: data.sessao || null,
      status: 'PENDING' as SignalStatus,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data: result, error } = await this.supabase
      .from('signals')
      .insert(signalData as any)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Falha ao criar sinal: ${error?.message || 'Erro desconhecido'}`);
    }

    return this.mapRowToSignal(result);
  }

  async findById(id: string): Promise<Signal | null> {
    const { data, error } = await this.supabase
      .from('signals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToSignal(data);
  }

  async findAll(limit = 100, offset = 0): Promise<Signal[]> {
    const { data, error } = await this.supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      return [];
    }

    return data.map((row) => this.mapRowToSignal(row));
  }

  async findBySymbol(symbol: string, limit = 100): Promise<Signal[]> {
    const { data, error } = await this.supabase
      .from('signals')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row) => this.mapRowToSignal(row));
  }

  async updateStatus(id: string, status: SignalStatus, hitPrice: number): Promise<Signal> {
    const now = new Date();
    const updateData: any = {
      status,
      updated_at: now.toISOString(),
    };

    // Adicionar campos específicos baseado no status
    if (status === 'STOP_LOSS') {
      updateData.stop_hit_at = now.toISOString();
      updateData.stop_hit_price = hitPrice.toString();
    } else if (status === 'TAKE1') {
      updateData.take1_hit_at = now.toISOString();
      updateData.take1_hit_price = hitPrice.toString();
    } else if (status === 'TAKE2') {
      updateData.take2_hit_at = now.toISOString();
      updateData.take2_hit_price = hitPrice.toString();
    } else if (status === 'TAKE3') {
      updateData.status = 'ENCERRADO'; // Take 3 automaticamente encerra
      updateData.take3_hit_at = now.toISOString();
      updateData.take3_hit_price = hitPrice.toString();
    }
    // EM_OPERACAO e ENCERRADO não precisam de campos adicionais

    const { data, error } = await this.supabase
      .from('signals')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Erro ao atualizar status: ${error?.message || 'Erro desconhecido'}`);
    }

    return this.mapRowToSignal(data);
  }

  async update(
    id: string,
    data: {
      entry?: number;
      stopLoss?: number;
      take1?: number;
      take2?: number;
      take3?: number;
      stopTicks?: number;
    }
  ): Promise<Signal> {
    const now = new Date();
    const updateData: any = {
      updated_at: now.toISOString(),
    };

    if (data.entry !== undefined) updateData.entry = data.entry.toString();
    if (data.stopLoss !== undefined) updateData.stop_loss = data.stopLoss.toString();
    if (data.take1 !== undefined) updateData.take1 = data.take1.toString();
    if (data.take2 !== undefined) updateData.take2 = data.take2.toString();
    if (data.take3 !== undefined) updateData.take3 = data.take3.toString();
    if (data.stopTicks !== undefined) updateData.stop_ticks = data.stopTicks;

    if (Object.keys(updateData).length === 1) {
      // Apenas updated_at, nada para atualizar
      throw new Error('Nenhum campo fornecido para atualização');
    }

    const { data: result, error } = await this.supabase
      .from('signals')
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single();

    if (error || !result) {
      throw new Error(`Erro ao atualizar sinal: ${error?.message || 'Erro desconhecido'}`);
    }

    return this.mapRowToSignal(result);
  }

  /**
   * Obtém estatísticas de performance dos sinais
   */
  async getStats(days: number): Promise<SignalStats> {
    const now = new Date();
    const startDate = new Date(now);

    if (days === 1) {
      // Hoje: desde meia-noite
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Últimos N dias
      startDate.setDate(now.getDate() - days);
    }

    // Buscar sinais encerrados no período
    const { data, error } = await this.supabase
      .from('signals')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .in('status', ['STOP_LOSS', 'TAKE1', 'TAKE2', 'TAKE3', 'ENCERRADO']);

    if (error || !data) {
      return {
        totalPips: 0,
        totalSignals: 0,
        winRate: 0,
        wins: 0,
        losses: 0,
        period: days === 1 ? 'today' : days === 30 ? '30days' : '90days',
      };
    }

    let totalPips = 0;
    let wins = 0;
    let losses = 0;

    data.forEach((row) => {
      const signal = this.mapRowToSignal(row);
      const pips = this.calculateSignalPips(signal);

      totalPips += pips;

      if (pips > 0) {
        wins++;
      } else if (pips < 0) {
        losses++;
      }
    });

    const totalSignals = wins + losses;
    const winRate = totalSignals > 0 ? (wins / totalSignals) * 100 : 0;

    return {
      totalPips: Math.round(totalPips * 10) / 10, // 1 casa decimal
      totalSignals,
      winRate: Math.round(winRate * 10) / 10,
      wins,
      losses,
      period: days === 1 ? 'today' : days === 30 ? '30days' : '90days',
    };
  }

  /**
   * Calcula pips de um sinal baseado no status final
   */
  private calculateSignalPips(signal: Signal): number {
    const { status, entry, stopLoss, take1, take2, take3, stopTicks, type } = signal;

    // Se ainda está pendente ou em operação, retorna 0
    if (status === 'PENDING' || status === 'EM_OPERACAO') {
      return 0;
    }

    // Se atingiu stop loss, retorna negativo
    if (status === 'STOP_LOSS') {
      return -stopTicks;
    }

    // Calcular pips baseado no take atingido
    let pips = 0;

    // BUY: lucro = take - entry (positivo)
    // SELL: lucro = entry - take (positivo) = (take - entry) * -1
    const multiplier = type === 'BUY' ? 1 : -1;

    if (status === 'TAKE1' || status === 'TAKE2' || status === 'TAKE3' || status === 'ENCERRADO') {
      // Usar os valores de hit price se disponíveis, senão usar os targets
      if (signal.take3HitPrice) {
        pips = (signal.take3HitPrice - entry) * multiplier;
      } else if (signal.take2HitPrice) {
        pips = (signal.take2HitPrice - entry) * multiplier;
      } else if (signal.take1HitPrice) {
        pips = (signal.take1HitPrice - entry) * multiplier;
      } else {
        // Fallback: estimar baseado nos targets
        if (status === 'TAKE3') {
          pips = (take3 - entry) * multiplier;
        } else if (status === 'TAKE2') {
          pips = (take2 - entry) * multiplier;
        } else if (status === 'TAKE1') {
          pips = (take1 - entry) * multiplier;
        }
      }
    } else if (status === 'STOP_LOSS') {
      // Calcular perda quando stop é atingido
      if (signal.stopHitPrice) {
        pips = (signal.stopHitPrice - entry) * multiplier;
      } else {
        // Fallback: usar o valor do stop loss
        pips = (stopLoss - entry) * multiplier;
      }
    }

    // Converter para pips (assumindo que os valores estão em preço)
    // Para GOLD, 1 pip = 0.10 na maioria das corretoras
    return Math.round(pips * 10) / 10;
  }

  /**
   * Mapeia uma linha do banco para a entidade Signal
   */
  private mapRowToSignal(row: any): Signal {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      symbol: row.symbol,
      entry: parseFloat(row.entry),
      stopLoss: parseFloat(row.stop_loss),
      take1: parseFloat(row.take1),
      take2: parseFloat(row.take2),
      take3: parseFloat(row.take3),
      stopTicks: parseInt(row.stop_ticks, 10),
      time: new Date(row.time),
      sessao: row.sessao || undefined,
      status: (row.status || 'PENDING') as SignalStatus,
      stopHitAt: row.stop_hit_at ? new Date(row.stop_hit_at) : undefined,
      take1HitAt: row.take1_hit_at ? new Date(row.take1_hit_at) : undefined,
      take2HitAt: row.take2_hit_at ? new Date(row.take2_hit_at) : undefined,
      take3HitAt: row.take3_hit_at ? new Date(row.take3_hit_at) : undefined,
      stopHitPrice: row.stop_hit_price ? parseFloat(row.stop_hit_price) : undefined,
      take1HitPrice: row.take1_hit_price ? parseFloat(row.take1_hit_price) : undefined,
      take2HitPrice: row.take2_hit_price ? parseFloat(row.take2_hit_price) : undefined,
      take3HitPrice: row.take3_hit_price ? parseFloat(row.take3_hit_price) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
