/**
 * Splash Screen - Tela inicial animada
 * 
 * Exibe "TakePips" em amarelo com efeitos de candle de alta e baixa
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCurrentUser } from '@/presentation/hooks/useAuth';

const { width, height } = Dimensions.get('window');

// Manter splash screen visível
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const candleUpAnim = useRef(new Animated.Value(0)).current;
  const candleDownAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Animação de candle de alta (verde subindo)
      Animated.loop(
        Animated.sequence([
          Animated.timing(candleUpAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(candleUpAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      // Animação de candle de baixa (vermelho descendo)
      Animated.loop(
        Animated.sequence([
          Animated.timing(candleDownAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(candleDownAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  useEffect(() => {
    // Aguardar verificação de autenticação e mínimo 1.5 segundos de splash
    const minSplashTime = 1500;
    const maxWaitTime = 3000; // Timeout máximo de 3 segundos para não travar
    const startTime = Date.now();

    const checkAuth = async () => {
      // Aguardar até que o loading termine ou timeout (não mais que 3 segundos)
      const waitStart = Date.now();
      while (isLoading && (Date.now() - waitStart) < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Se ainda está carregando após timeout, prosseguir mesmo assim
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minSplashTime - elapsed);

      await new Promise((resolve) => setTimeout(resolve, remaining));

      // Esconder splash screen nativa
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('[Splash] Error hiding splash:', error);
      }

      // Redirecionar baseado no estado de autenticação
      // Usar setTimeout para garantir que o hideAsync foi processado
      setTimeout(() => {
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 100);
    };

    // Iniciar verificação imediatamente
    checkAuth();
  }, [user, isLoading, router]);

  // Posição das candles
  const candleUpTranslateY = candleUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const candleDownTranslateY = candleDownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const candleUpOpacity = candleUpAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const candleDownOpacity = candleDownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View style={styles.container}>
      {/* Candles de alta (verde) */}
      <Animated.View
        style={[
          styles.candle,
          styles.candleUp,
          {
            transform: [{ translateY: candleUpTranslateY }],
            opacity: candleUpOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.candle,
          styles.candleUp,
          {
            left: width * 0.2,
            transform: [{ translateY: candleUpTranslateY }],
            opacity: candleUpOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.candle,
          styles.candleUp,
          {
            right: width * 0.2,
            transform: [{ translateY: candleUpTranslateY }],
            opacity: candleUpOpacity,
          },
        ]}
      />

      {/* Logo TakePips */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.jpeg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Candles de baixa (vermelho) */}
      <Animated.View
        style={[
          styles.candle,
          styles.candleDown,
          {
            bottom: height * 0.15,
            transform: [{ translateY: candleDownTranslateY }],
            opacity: candleDownOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.candle,
          styles.candleDown,
          {
            bottom: height * 0.15,
            left: width * 0.25,
            transform: [{ translateY: candleDownTranslateY }],
            opacity: candleDownOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.candle,
          styles.candleDown,
          {
            bottom: height * 0.15,
            right: width * 0.25,
            transform: [{ translateY: candleDownTranslateY }],
            opacity: candleDownOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161614',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 300,
    maxHeight: 300,
  },
  candle: {
    position: 'absolute',
    width: 8,
    height: 60,
    borderRadius: 4,
  },
  candleUp: {
    top: height * 0.15,
    backgroundColor: '#2ECC71', // Verde (alta)
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  candleDown: {
    backgroundColor: '#E74C3C', // Vermelho (baixa)
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
