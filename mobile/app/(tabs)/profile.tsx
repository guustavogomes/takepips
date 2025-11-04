/**
 * Tela Perfil - Configurações e Informações do Usuário
 *
 * Gerenciamento de perfil, estatísticas e configurações
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header com avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GT</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>Gustavo Trader</Text>
        <Text style={styles.userEmail}>gustavo@takepips.com</Text>

        <View style={styles.membershipBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.membershipText}>Membro Premium</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Taxa de Acerto</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="finance" size={24} color="#FFD700" />
          <Text style={styles.statValue}>127</Text>
          <Text style={styles.statLabel}>Sinais Recebidos</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#6366f1" />
          <Text style={styles.statValue}>+15%</Text>
          <Text style={styles.statLabel}>ROI Mensal</Text>
        </View>
      </View>

      {/* Seção de Conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Conta</Text>

        <TouchableOpacity style={styles.menuItem}>
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

        <TouchableOpacity style={styles.menuItem}>
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

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Idioma</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemRightText}>Português</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
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

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Central de Ajuda</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="chatbubble-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Falar com Suporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={22} color="#FFD700" />
            <Text style={styles.menuItemText}>Termos de Uso</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
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
