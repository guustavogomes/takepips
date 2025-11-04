/**
 * Tela Educação - E-books e Material Didático
 *
 * Biblioteca de e-books sobre Forex e GOLD trading
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Ebook {
  id: number;
  title: string;
  author: string;
  description: string;
  pages: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  downloadUrl?: string;
  isPremium: boolean;
}

const EBOOKS: Ebook[] = [
  {
    id: 1,
    title: 'Guia Completo de Forex para Iniciantes',
    author: 'TakePips Academy',
    description:
      'Aprenda os fundamentos do mercado Forex, desde conceitos básicos até suas primeiras operações.',
    pages: 120,
    level: 'beginner',
    category: 'Fundamentos',
    isPremium: false,
  },
  {
    id: 2,
    title: 'GOLD Trading: Estratégias Avançadas',
    author: 'Expert Traders',
    description:
      'Domine as estratégias profissionais para operar XAU/USD com alta precisão e lucro consistente.',
    pages: 85,
    level: 'advanced',
    category: 'Estratégias',
    isPremium: true,
  },
  {
    id: 3,
    title: 'Análise Técnica na Prática',
    author: 'TakePips Academy',
    description:
      'Entenda indicadores técnicos, padrões gráficos e como usá-los para tomar decisões de trading.',
    pages: 95,
    level: 'intermediate',
    category: 'Análise Técnica',
    isPremium: false,
  },
  {
    id: 4,
    title: 'Gerenciamento de Risco no Forex',
    author: 'Risk Masters',
    description:
      'Aprenda a proteger seu capital com técnicas profissionais de gerenciamento de risco.',
    pages: 75,
    level: 'beginner',
    category: 'Gestão de Risco',
    isPremium: false,
  },
  {
    id: 5,
    title: 'Psicologia do Trading',
    author: 'Mind Traders',
    description:
      'Desenvolva a mentalidade correta para se tornar um trader consistente e disciplinado.',
    pages: 110,
    level: 'intermediate',
    category: 'Psicologia',
    isPremium: true,
  },
];

export default function EducationScreen() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const getLevelColor = (level: Ebook['level']) => {
    switch (level) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#FFD700';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6B7280';
    }
  };

  const getLevelLabel = (level: Ebook['level']) => {
    switch (level) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return '';
    }
  };

  const handleDownload = (ebook: Ebook) => {
    if (ebook.isPremium) {
      Alert.alert(
        '🌟 Conteúdo Premium',
        'Este e-book é exclusivo para assinantes Premium. Deseja fazer upgrade?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Planos', onPress: () => console.log('Navigate to plans') },
        ]
      );
    } else {
      Alert.alert(
        '📥 Download Iniciado',
        `O e-book "${ebook.title}" será baixado em breve.`,
        [{ text: 'OK' }]
      );
    }
  };

  const filteredEbooks = selectedLevel
    ? EBOOKS.filter((e) => e.level === selectedLevel)
    : EBOOKS;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca de E-books 📚</Text>
        <Text style={styles.headerSubtitle}>
          Aprenda Forex do básico ao avançado com nossos materiais gratuitos
        </Text>
      </View>

      {/* Filtros por nível */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Filtrar por nível:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedLevel && styles.filterChipActive,
            ]}
            onPress={() => setSelectedLevel(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedLevel && styles.filterChipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedLevel === 'beginner' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedLevel('beginner')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedLevel === 'beginner' && styles.filterChipTextActive,
              ]}
            >
              🟢 Iniciante
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedLevel === 'intermediate' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedLevel('intermediate')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedLevel === 'intermediate' && styles.filterChipTextActive,
              ]}
            >
              🟡 Intermediário
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedLevel === 'advanced' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedLevel('advanced')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedLevel === 'advanced' && styles.filterChipTextActive,
              ]}
            >
              🔴 Avançado
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de E-books */}
      <View style={styles.ebooksContainer}>
        {filteredEbooks.map((ebook) => (
          <TouchableOpacity
            key={ebook.id}
            style={styles.ebookCard}
            activeOpacity={0.7}
            onPress={() => handleDownload(ebook)}
          >
            {/* Badge Premium */}
            {ebook.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}

            {/* Capa do E-book (placeholder) */}
            <View
              style={[
                styles.ebookCover,
                { backgroundColor: getLevelColor(ebook.level) + '30' },
              ]}
            >
              <Ionicons
                name="book"
                size={48}
                color={getLevelColor(ebook.level)}
              />
            </View>

            {/* Informações */}
            <View style={styles.ebookInfo}>
              <Text style={styles.ebookTitle}>{ebook.title}</Text>
              <Text style={styles.ebookAuthor}>Por {ebook.author}</Text>
              <Text style={styles.ebookDescription}>{ebook.description}</Text>

              {/* Metadados */}
              <View style={styles.metadataContainer}>
                <View style={styles.metadataItem}>
                  <Ionicons name="document-text" size={14} color="#6B7280" />
                  <Text style={styles.metadataText}>{ebook.pages} páginas</Text>
                </View>

                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: getLevelColor(ebook.level) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelText,
                      { color: getLevelColor(ebook.level) },
                    ]}
                  >
                    {getLevelLabel(ebook.level)}
                  </Text>
                </View>

                <View style={styles.metadataItem}>
                  <MaterialCommunityIcons
                    name="tag"
                    size={14}
                    color="#6B7280"
                  />
                  <Text style={styles.metadataText}>{ebook.category}</Text>
                </View>
              </View>

              {/* Botão de Download */}
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  ebook.isPremium && styles.downloadButtonPremium,
                ]}
                onPress={() => handleDownload(ebook)}
              >
                <Ionicons
                  name={ebook.isPremium ? 'lock-closed' : 'download'}
                  size={18}
                  color={ebook.isPremium ? '#FFD700' : '#10b981'}
                />
                <Text
                  style={[
                    styles.downloadButtonText,
                    ebook.isPremium && styles.downloadButtonTextPremium,
                  ]}
                >
                  {ebook.isPremium ? 'Premium' : 'Baixar Grátis'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <Ionicons name="library" size={40} color="#FFD700" />
        <Text style={styles.ctaTitle}>Quer mais conteúdo?</Text>
        <Text style={styles.ctaSubtitle}>
          Assine o plano Premium e tenha acesso ilimitado a todos os e-books e
          materiais exclusivos
        </Text>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Ver Planos Premium</Text>
          <Ionicons name="arrow-forward" size={18} color="#0A0E27" />
        </TouchableOpacity>
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0f1419',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  filterChipActive: {
    backgroundColor: '#FFD700' + '20',
    borderColor: '#FFD700',
  },
  filterChipText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFD700',
  },
  ebooksContainer: {
    paddingHorizontal: 20,
  },
  ebookCard: {
    backgroundColor: '#0f1419',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1a1f2e',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  premiumText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  ebookCover: {
    width: 80,
    height: 110,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ebookInfo: {
    flex: 1,
  },
  ebookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ebookAuthor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  ebookDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 11,
    color: '#6B7280',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981' + '20',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  downloadButtonPremium: {
    backgroundColor: '#FFD700' + '20',
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  downloadButtonTextPremium: {
    color: '#FFD700',
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
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
});
