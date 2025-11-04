/**
 * Splash Screen - Tela inicial animada
 * 
 * Exibe "TakePips" em amarelo com efeitos de candle de alta e baixa
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
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
    // Aguardar verificação de autenticação e mínimo 3.5 segundos de splash
    // Para que o usuário possa ver a animação bonita
    const minSplashTime = 3500;
    const startTime = Date.now();

    const checkAuth = async () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minSplashTime - elapsed);

      await new Promise((resolve) => setTimeout(resolve, remaining));

      SplashScreen.hideAsync();

      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    };

    if (!isLoading) {
      checkAuth();
    }
  }, [user, isLoading]);

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
        <Text style={styles.logoText}>TakePips</Text>
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
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFD700', // Amarelo ouro
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
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
