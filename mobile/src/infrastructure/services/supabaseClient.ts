/**
 * Cliente Supabase para React Native
 * 
 * Configuração do cliente Supabase para autenticação e banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Obter configurações do app.config.js
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ⚠️ Supabase URL ou Anon Key não configurados!\n' +
    'Configure em mobile/app.config.js:\n' +
    'extra: {\n' +
    '  supabaseUrl: "https://xxxxx.supabase.co",\n' +
    '  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n' +
    '}'
  );
}

/**
 * Cliente Supabase para React Native
 * 
 * Usa AsyncStorage para persistir sessões
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // React Native não usa URLs
    },
  }
);
