/**
 * Domain Layer - Auth Repository Interface
 * 
 * Seguindo ISP: Interface segregada apenas para operações de autenticação
 */

import { RegisterData, LoginData, AuthResponse, User } from '../models/User';

export interface IAuthRepository {
  /**
   * Registra um novo usuário
   */
  register(data: RegisterData): Promise<AuthResponse>;

  /**
   * Faz login do usuário
   */
  login(data: LoginData): Promise<AuthResponse>;

  /**
   * Faz logout do usuário
   */
  logout(): Promise<void>;

  /**
   * Obtém o usuário atual autenticado
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Atualiza o token de autenticação
   */
  refreshToken(refreshToken: string): Promise<AuthResponse>;
}
