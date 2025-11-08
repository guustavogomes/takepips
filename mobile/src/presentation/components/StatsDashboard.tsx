/**
 * Stats Dashboard Component
 *
 * Dashboard de estatísticas com design moderno e legível
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://takepips.vercel.app';

const fetchStats = async (): Promise<StatsResponse> => {
  const response = await fetch(`${API_URL}/api/signals/stats?period=all`);

  if (!response.ok) {
    throw new Error('Erro ao buscar estatísticas');
  }

  const data = await response.json();
  return data.data;
};

export function StatsDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['signal-stats'],
    queryFn: fetchStats,
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // Atualizar a cada 5 minutos
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  if (error || !stats) {
    return null;
  }

  const renderStatCard = (
    title: string,
    stat: SignalStats,
    icon: string,
    accentColor: string
  ) => {
    const isPositive = stat.totalPips >= 0;

    return (
      <View style={[styles.statCard, { borderColor: accentColor }]}>
        {/* Header com ícone e título */}
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name={icon as any} size={22} color={accentColor} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        {/* Pips principais */}
        <View style={styles.pipsContainer}>
          <Text
            style={[
              styles.pipsValue,
              { color: isPositive ? '#10b981' : '#ef4444' },
            ]}
          >
            {isPositive ? '+' : ''}
            {stat.totalPips.toFixed(1)}
          </Text>
          <Text style={styles.pipsLabel}>pips</Text>
        </View>

        {/* Métricas secundárias */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Taxa Sinais</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, { color: accentColor }]}>
                {stat.winRate.toFixed(0)}%
              </Text>
              <Text style={styles.metricSeparator}>•</Text>
              <Text style={styles.metricSecondary}>{stat.totalSignals}</Text>
            </View>
          </View>
        </View>

        {/* W/L em destaque */}
        <View style={styles.wlContainer}>
          <View style={styles.wlItem}>
            <Text style={[styles.wlValue, { color: '#10b981' }]}>{stat.wins}</Text>
            <Text style={styles.wlLabel}>W</Text>
          </View>
          <View style={styles.wlDivider} />
          <View style={styles.wlItem}>
            <Text style={[styles.wlValue, { color: '#ef4444' }]}>{stat.losses}</Text>
            <Text style={styles.wlLabel}>L</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header da seção */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="chart-line" size={24} color="#FFD700" />
        <Text style={styles.sectionTitle}>Performance</Text>
      </View>

      {/* Grid de estatísticas */}
      <View style={styles.statsGrid}>
        {renderStatCard('Hoje', stats.today, 'calendar-today', '#FFD700')}
        {renderStatCard('30 Dias', stats.last30Days, 'calendar-month', '#6366f1')}
        {renderStatCard('90 Dias', stats.last90Days, 'chart-timeline-variant', '#10b981')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f1419',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pipsContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pipsValue: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  pipsLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: -2,
    fontWeight: '600',
  },
  metricsRow: {
    marginBottom: 10,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  metricSeparator: {
    fontSize: 10,
    color: '#4B5563',
  },
  metricSecondary: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  wlContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1f2e',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wlItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  wlValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  wlLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '700',
  },
  wlDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#374151',
  },
});
