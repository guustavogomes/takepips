import { ISignalRepository } from '../../domain/repositories/ISignalRepository';
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
