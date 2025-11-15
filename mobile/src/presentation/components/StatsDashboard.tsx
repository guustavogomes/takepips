/**
 * Stats Dashboard Component
 *
 * Dashboard de estatísticas com design moderno e legível
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  // Estado para controlar quais cards estão expandidos - todos fechados por padrão
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const renderStatCard = (
    cardId: string,
    title: string,
    stat: SignalStats,
    icon: string,
    accentColor: string
  ) => {
    const isPositive = stat.totalPips >= 0;
    const isExpanded = expandedCards.has(cardId);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleCard(cardId)}
        style={[styles.statCard, { borderColor: accentColor }]}
      >
        {/* Header com ícone, título e indicador de expansão */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <MaterialCommunityIcons name={icon as any} size={18} color={accentColor} />
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            {/* Pips compactos sempre visíveis */}
            <Text
              style={[
                styles.compactPips,
                { color: isPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isPositive ? '+' : ''}
              {stat.totalPips.toFixed(1)}
            </Text>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </View>
        </View>

        {/* Conteúdo expandido */}
        {isExpanded && (
          <>
            {/* Métricas secundárias */}
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Taxa • Sinais</Text>
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
          </>
        )}
      </TouchableOpacity>
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
        {renderStatCard('today', 'Hoje', stats.today, 'calendar-today', '#FFD700')}
        {renderStatCard('30days', '30 Dias', stats.last30Days, 'calendar-month', '#6366f1')}
        {renderStatCard('90days', '90 Dias', stats.last90Days, 'chart-timeline-variant', '#10b981')}
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
    flexDirection: 'column',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#0f1419',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactPips: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  metricsRow: {
    marginTop: 12,
    marginBottom: 8,
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
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  wlItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  wlValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  wlLabel: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '700',
  },
  wlDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#374151',
  },
});
