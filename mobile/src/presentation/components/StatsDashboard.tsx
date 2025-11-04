/**
 * Stats Dashboard Component
 *
 * Exibe estatísticas de performance dos sinais
 * - Pips de hoje
 * - Pips últimos 30 dias
 * - Pips últimos 90 dias
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#FFD700" />
      </View>
    );
  }

  if (error || !stats) {
    return null; // Não mostra nada se der erro
  }

  const renderStatCard = (
    title: string,
    stat: SignalStats,
    icon: keyof typeof Ionicons.glyphMap,
    color: string
  ) => {
    const isPositive = stat.totalPips >= 0;

    return (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={18} color={color} />
          <Text style={styles.statTitle}>{title}</Text>
        </View>

        <View style={styles.statBody}>
          <Text
            style={[
              styles.statPips,
              { color: isPositive ? '#10b981' : '#ef4444' },
            ]}
          >
            {isPositive ? '+' : ''}
            {stat.totalPips.toFixed(1)}
          </Text>
          <Text style={styles.statPipsLabel}>pips</Text>
        </View>

        <View style={styles.statFooter}>
          <View style={styles.statMetric}>
            <Text style={styles.statMetricLabel}>Taxa</Text>
            <Text style={styles.statMetricValue}>{stat.winRate.toFixed(0)}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statMetric}>
            <Text style={styles.statMetricLabel}>Sinais</Text>
            <Text style={styles.statMetricValue}>{stat.totalSignals}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statMetric}>
            <Text style={styles.statMetricLabel}>W/L</Text>
            <Text style={styles.statMetricValue}>
              {stat.wins}/{stat.losses}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={20} color="#FFD700" />
        <Text style={styles.headerTitle}>Performance</Text>
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Hoje', stats.today, 'today', '#FFD700')}
        {renderStatCard('30 Dias', stats.last30Days, 'calendar', '#6366f1')}
        {renderStatCard('90 Dias', stats.last90Days, 'trending-up', '#10b981')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f1419',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderColor: '#1a1f2e',
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  statTitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  statBody: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statPips: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statPipsLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: -4,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a1f2e',
  },
  statMetric: {
    alignItems: 'center',
  },
  statMetricLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  statMetricValue: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1f2e',
  },
});
