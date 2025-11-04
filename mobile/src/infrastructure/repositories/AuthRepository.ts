/**
 * Infrastructure Layer - Auth Repository Implementation
 * 
 * Implementação usando Neon Authentication
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { RegisterData, LoginData, AuthResponse, User } from '@/domain/models/User';
import { apiClient } from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@takepips:auth_token';
const USER_KEY = '@takepips:user';

interface ApiAuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      fullName: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
    refreshToken?: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

export class AuthRepository implements IAuthRepository {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiAuthResponse>(
        '/api/auth/register',
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao registrar usuário');
      }

      // Remover "Bearer " do token se presente
      const token = response.data.token.replace(/^Bearer /, '');

      const authResponse: AuthResponse = {
        user: {
          ...response.data.user,
          createdAt: new Date(response.data.user.createdAt),
          updatedAt: new Date(response.data.user.updatedAt),
        },
        token: token,
        refreshToken: response.data.refreshToken,
      };

      // Salvar token e usuário
      await this.saveAuthData(authResponse);

      return authResponse;
    } catch (error) {
      console.error('[AuthRepository] Error registering:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiAuthResponse>(
        '/api/auth/login',
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Erro ao fazer login');
      }

      // Remover "Bearer " do token se presente
      const token = response.data.token.replace(/^Bearer /, '');

      const authResponse: AuthResponse = {
        user: {
          ...response.data.user,
          createdAt: new Date(response.data.user.createdAt),
          updatedAt: new Date(response.data.user.updatedAt),
        },
        token: token,
        refreshToken: response.data.refreshToken,
      };

      // Salvar token e usuário
      await this.saveAuthData(authResponse);

      return authResponse;
    } catch (error) {
      console.error('[AuthRepository] Error logging in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('[AuthRepository] Error logging out:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      if (!userJson) {
        return null;
      }

      const user = JSON.parse(userJson);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    } catch (error) {
      console.error('[AuthRepository] Error getting current user:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiAuthResponse>(
        '/api/auth/refresh',
        { refreshToken }
      );

      if (!response.success || !response.data) {
        throw new Error('Erro ao atualizar token');
      }

      const authResponse: AuthResponse = {
        user: {
          ...response.data.user,
          createdAt: new Date(response.data.user.createdAt),
          updatedAt: new Date(response.data.user.updatedAt),
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      };

      await this.saveAuthData(authResponse);

      return authResponse;
    } catch (error) {
      console.error('[AuthRepository] Error refreshing token:', error);
      throw error;
    }
  }

  private async saveAuthData(authResponse: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, authResponse.token],
      [USER_KEY, JSON.stringify(authResponse.user)],
    ]);
  }
}
