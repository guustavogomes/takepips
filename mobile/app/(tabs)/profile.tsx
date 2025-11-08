/**
 * Tela Perfil - Configurações e Informações do Usuário
 *
 * Gerenciamento de perfil, estatísticas e configurações
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/infrastructure/services/supabaseClient';
import { useCurrentUser } from '@/presentation/hooks/useAuth';
import { showSuccess, showError } from '@/shared/utils/toast';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://takepips.vercel.app';

interface SignalStats {
  totalPips: number;
  totalSignals: number;
  winRate: number;
  wins: number;
  losses: number;
  period: 'today' | '30days' | '90days';
}

interface StatsResponse {
  today: SignalStats;
  last30Days: SignalStats;
  last90Days: SignalStats;
}

const fetchStats = async (): Promise<StatsResponse> => {
  const response = await fetch(`${API_URL}/api/signals/stats?period=all`);

  if (!response.ok) {
    throw new Error('Erro ao buscar estatísticas');
  }

  const data = await response.json();
  return data.data;
};

export default function ProfileScreen() {
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    staleTime: 60000, // 1 minuto
  });

  // Carregar foto de perfil do Supabase Storage ou AsyncStorage
  useEffect(() => {
    loadProfileImage();
  }, [user]);

  const loadProfileImage = async () => {
    if (!user?.id) return;

    try {
      // Tentar carregar do Supabase Storage
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id}/avatar.jpg`);

      // Verificar se a imagem existe fazendo uma requisição
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      if (response.ok) {
        setProfileImage(data.publicUrl);
        return;
      }
    } catch (error) {
      console.log('[Profile] Tentando carregar foto do storage local...');
    }

    // Fallback: tentar carregar do AsyncStorage
    try {
      const localImage = await AsyncStorage.getItem(`profile_image_${user.id}`);
      if (localImage) {
        setProfileImage(localImage);
      }
    } catch (error) {
      console.log('[Profile] Foto de perfil não encontrada');
    }
  };

  const handlePickImage = async () => {
    try {
      // Solicitar permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
        return;
      }

      // Abrir seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[Profile] Erro ao selecionar imagem:', error);
      showError('Erro ao selecionar imagem');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) return;

    setIsUploadingImage(true);
    try {
      // Converter URI para blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Fazer upload para Supabase Storage
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        // Se o bucket não existir, tentar criar ou usar AsyncStorage como fallback
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          console.warn('[Profile] Bucket "avatars" não encontrado. Armazenando localmente.');
          // Fallback: salvar localmente usando AsyncStorage
          await AsyncStorage.setItem(`profile_image_${user.id}`, uri);
          setProfileImage(uri);
          showSuccess('Foto de perfil atualizada!');
          return;
        }
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileImage(data.publicUrl);
      showSuccess('Foto de perfil atualizada!');
    } catch (error) {
      console.error('[Profile] Erro ao fazer upload:', error);
      showError('Erro ao fazer upload da imagem. Verifique se o bucket "avatars" existe no Supabase.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await supabase.auth.signOut();
              showSuccess('Logout realizado com sucesso!');
              // O listener no _layout.tsx vai redirecionar automaticamente
            } catch (error) {
              console.error('[Profile] Erro ao fazer logout:', error);
              showError('Erro ao sair. Tente novamente.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Editar Perfil',
      'Funcionalidade em desenvolvimento. Em breve você poderá editar seu nome e outras informações.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacidade e Segurança',
      'Suas informações estão seguras. Todos os dados são criptografados e protegidos.',
      [{ text: 'OK' }]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Idioma',
      'O app está disponível apenas em Português no momento.',
      [{ text: 'OK' }]
    );
  };

  const handleSounds = () => {
    Alert.alert(
      'Sons e Alertas',
      'Configure os sons e alertas nas configurações do sistema.',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Linking.openURL('https://takepips.vercel.app').catch((err) =>
      console.error('Erro ao abrir link:', err)
    );
  };

  const handleSupport = () => {
    Linking.openURL('mailto:suporte@takepips.com').catch((err) =>
      console.error('Erro ao abrir email:', err)
    );
  };

  const handleTerms = () => {
    Linking.openURL('https://takepips.vercel.app/terms').catch((err) =>
      console.error('Erro ao abrir link:', err)
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Sobre o App',
      'TakePips v1.0.0\n\nSinais de GOLD trading com alta precisão.\n\nDesenvolvido com ❤️ para traders.',
      [{ text: 'OK' }]
    );
  };

  // Gerar iniciais do nome
  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name && name !== 'Usuário') {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Calcular estatísticas
  const winRate = stats?.last30Days?.winRate || 0;
  const totalSignals = stats?.last30Days?.totalSignals || 0;
  const roi = stats?.last30Days?.totalPips || 0;

  if (isLoadingUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header com avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(user?.fullName, user?.email)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handlePickImage}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>
          {user?.fullName || 'Usuário'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'carregando...'}
        </Text>

        <View style={styles.membershipBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.membershipText}>Membro Premium</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          {isLoadingStats ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 8 }} />
          ) : (
            <Text style={styles.statValue}>{winRate.toFixed(1)}%</Text>
          )}
          <Text style={styles.statLabel}>Taxa de Acerto</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="finance" size={24} color="#FFD700" />
          {isLoadingStats ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 8 }} />
          ) : (
            <Text style={styles.statValue}>{totalSignals}</Text>
          )}
          <Text style={styles.statLabel}>Sinais Recebidos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#6366f1" />
          {isLoadingStats ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 8 }} />
          ) : (
            <Text style={styles.statValue}>
              {roi > 0 ? '+' : ''}{roi.toFixed(1)} pips
            </Text>
          )}
          <Text style={styles.statLabel}>ROI (30 dias)</Text>
        </View>
      </View>

      {/* Seção de Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Conta</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="person-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="card-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Assinatura Premium</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Privacidade e Segurança</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Seção de Configurações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configurações</Text>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Notificações Push</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#374151', true: '#FFD700' + '50' }}
            thumbColor={notificationsEnabled ? '#FFD700' : '#6B7280'}
          />
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="moon-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Modo Escuro</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#374151', true: '#FFD700' + '50' }}
            thumbColor={darkMode ? '#FFD700' : '#6B7280'}
          />
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Idioma</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemRightText}>Português</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSounds}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="volume-medium-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Sons e Alertas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Seção de Suporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Suporte</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Central de Ajuda</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="chatbubble-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Falar com Suporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Termos de Uso</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="information-circle-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Sobre o App</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemRightText}>v1.0.0</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
        )}
        <Text style={styles.logoutButtonText}>
          {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>TakePips © 2025</Text>
        <Text style={styles.footerSubtext}>
          Sinais de GOLD trading com alta precisão
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0f1419',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#0f1419',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0A0E27',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  membershipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#0f1419',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f1419',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemRightText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444' + '15',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ef4444' + '30',
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 4,
  },
});
