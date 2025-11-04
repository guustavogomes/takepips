/**
 * Infrastructure Layer - Auth Repository Implementation
 * 
 * Implementação usando Supabase Auth (SDK nativo React Native)
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { RegisterData, LoginData, AuthResponse, User } from '@/domain/models/User';
import { supabase } from '../services/supabaseClient';

export class AuthRepositorySupabase implements IAuthRepository {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Nota: confirmPassword não está na interface RegisterData
      // A validação deve ser feita na UI antes de chamar este método

      // Registrar usando Supabase Auth SDK
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        console.error('[AuthRepositorySupabase] Erro ao registrar:', authError);
        
        // Tratar erros específicos
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered')) {
          throw new Error('Email já está em uso');
        }
        
        throw new Error(authError.message || 'Erro ao registrar usuário');
      }

      if (!authData.user) {
        throw new Error('Usuário criado mas dados não retornados');
      }

      // Se não houver sessão, significa que o email precisa ser confirmado
      // No Supabase, quando email confirmation está habilitado, signUp não retorna sessão
      if (!authData.session) {
        // Verificar se o email foi confirmado (pode ser que já esteja confirmado em alguns casos)
        // Se não houver sessão, o usuário precisa confirmar o email primeiro
        throw new Error('EMAIL_CONFIRMATION_REQUIRED: Usuário criado com sucesso! Verifique seu email para confirmar a conta antes de fazer login.');
      }

      const authResponse: AuthResponse = {
        user: {
          id: authData.user.id,
          fullName: authData.user.user_metadata?.full_name || data.fullName,
          email: authData.user.email!,
          createdAt: new Date(authData.user.created_at),
          updatedAt: new Date(authData.user.updated_at || authData.user.created_at),
        },
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      };

      return authResponse;
    } catch (error) {
      console.error('[AuthRepositorySupabase] Error registering:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Login usando Supabase Auth SDK
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('[AuthRepositorySupabase] Erro ao fazer login:', authError);
        
        // Tratar erros específicos do Supabase
        // Verificar se é erro de email não confirmado
        if (authError.message.includes('Email not confirmed') || 
            (authError.message.includes('Invalid login credentials') && 
             authError.message.toLowerCase().includes('confirm'))) {
          throw new Error('EMAIL_NOT_CONFIRMED: Email não confirmado. Verifique sua caixa de entrada e confirme sua conta antes de fazer login.');
        }
        
        // Erro de credenciais inválidas
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        
        throw new Error(authError.message || 'Erro ao fazer login');
      }

      if (!authData.user || !authData.session) {
        console.error('[AuthRepositorySupabase] Erro: usuário ou sessão não retornados');
        throw new Error('Email ou senha incorretos');
      }

      const authResponse: AuthResponse = {
        user: {
          id: authData.user.id,
          fullName: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Usuário',
          email: authData.user.email!,
          createdAt: new Date(authData.user.created_at),
          updatedAt: new Date(authData.user.updated_at || authData.user.created_at),
        },
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      };

      return authResponse;
    } catch (error) {
      console.error('[AuthRepositorySupabase] Error logging in:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[AuthRepositorySupabase] Error logging out:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        email: user.email!,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at),
      };
    } catch (error) {
      console.error('[AuthRepositorySupabase] Error getting current user:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (authError || !authData.user || !authData.session) {
        throw new Error('Erro ao atualizar token');
      }

      const authResponse: AuthResponse = {
        user: {
          id: authData.user.id,
          fullName: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Usuário',
          email: authData.user.email!,
          createdAt: new Date(authData.user.created_at),
          updatedAt: new Date(authData.user.updated_at || authData.user.created_at),
        },
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      };

      return authResponse;
    } catch (error) {
      console.error('[AuthRepositorySupabase] Error refreshing token:', error);
      throw error;
    }
  }
}
