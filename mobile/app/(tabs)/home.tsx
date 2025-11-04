/**
 * Tela Home - Vídeos do YouTube
 *
 * Exibe vídeos educacionais sobre GOLD trading
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface VideoData {
  id: string;
  title: string;
  description: string;
  category: 'tutorial' | 'analysis' | 'strategy';
}

// Lista de vídeos do YouTube sobre GOLD trading
const VIDEOS: VideoData[] = [
  {
    id: 'dQw4w9WgXcQ', // Substitua pelo ID real do vídeo
    title: 'Como Operar GOLD - Estratégias Básicas',
    description: 'Aprenda as estratégias fundamentais para operar XAU/USD',
    category: 'tutorial',
  },
  {
    id: 'dQw4w9WgXcQ', // Substitua pelo ID real do vídeo
    title: 'Análise Técnica do GOLD',
    description: 'Análise completa dos principais indicadores para GOLD',
    category: 'analysis',
  },
  {
    id: 'dQw4w9WgXcQ', // Substitua pelo ID real do vídeo
    title: 'Melhores Horários para Operar GOLD',
    description: 'Descubra quando o mercado de ouro está mais volátil',
    category: 'strategy',
  },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    // Simula carregamento
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getCategoryColor = (category: VideoData['category']) => {
    switch (category) {
      case 'tutorial':
        return '#10b981';
      case 'analysis':
        return '#FFD700';
      case 'strategy':
        return '#6366f1';
      default:
        return '#6B7280';
    }
  };

  const getCategoryLabel = (category: VideoData['category']) => {
    switch (category) {
      case 'tutorial':
        return '📚 Tutorial';
      case 'analysis':
        return '📊 Análise';
      case 'strategy':
        return '🎯 Estratégia';
      default:
        return '';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFD700"
          colors={['#FFD700']}
        />
      }
    >
      {/* Header com boas-vindas */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bem-vindo ao TakePips! 👋</Text>
        <Text style={styles.headerSubtitle}>
          Aprenda a operar GOLD com nossos vídeos educacionais
        </Text>
      </View>

      {/* Estatísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="play-circle" size={24} color="#FFD700" />
          <Text style={styles.statValue}>{VIDEOS.length}</Text>
          <Text style={styles.statLabel}>Vídeos</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.statValue}>95%</Text>
          <Text style={styles.statLabel}>Precisão</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="people" size={24} color="#6366f1" />
          <Text style={styles.statValue}>1.2k</Text>
          <Text style={styles.statLabel}>Alunos</Text>
        </View>
      </View>

      {/* Lista de vídeos */}
      <View style={styles.videosSection}>
        <Text style={styles.sectionTitle}>📺 Vídeos Recomendados</Text>

        {VIDEOS.map((video, index) => (
          <View key={index} style={styles.videoCard}>
            {/* Categoria */}
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(video.category) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(video.category) },
                ]}
              >
                {getCategoryLabel(video.category)}
              </Text>
            </View>

            {/* Player do YouTube */}
            <View style={styles.playerContainer}>
              <YoutubePlayer
                height={200}
                videoId={video.id}
                onChangeState={(state) => {
                  if (state === 'playing') {
                    setCurrentVideoId(video.id);
                  }
                }}
              />
            </View>

            {/* Informações do vídeo */}
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDescription}>{video.description}</Text>

              <TouchableOpacity
                style={styles.watchButton}
                onPress={() => setCurrentVideoId(video.id)}
              >
                <Ionicons name="play-circle" size={20} color="#FFD700" />
                <Text style={styles.watchButtonText}>Assistir Agora</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <Ionicons name="rocket" size={32} color="#FFD700" />
        <Text style={styles.ctaTitle}>Pronto para começar?</Text>
        <Text style={styles.ctaSubtitle}>
          Assista nossos vídeos e comece a lucrar com GOLD trading
        </Text>
      </View>

      {/* Espaçamento inferior */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statBox: {
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
  },
  videosSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  videoCard: {
    backgroundColor: '#0f1419',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  playerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '15',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  ctaContainer: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#0f1419',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700' + '30',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 12,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
