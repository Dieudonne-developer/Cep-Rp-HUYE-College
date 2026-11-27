import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_VARIANT } from '@/config/variant';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const title = APP_VARIANT === 'user' ? 'CEP APP' : 'Admin CEP';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8', '#1e40af']}
        style={styles.gradientBackground}
      >
        <View style={styles.wavePattern}>
          <View style={styles.wave1} />
          <View style={styles.wave2} />
          <View style={styles.wave3} />
        </View>
      </LinearGradient>

      <View style={styles.contentOverlay}>
        <Text style={styles.topTitle}>WELCOME TO {title}</Text>

        <View style={styles.logoContainer}>
          <Image source={require('../../assets/log.jpg')} style={styles.logo} />
        </View>

        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.quote}>
          Grace be unto you and peace from God our Father and from the Lord Jesus Christ.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wavePattern: {
    flex: 1,
    opacity: 0.1,
  },
  wave1: {
    position: 'absolute',
    bottom: height * 0.3,
    left: -50,
    width: width * 0.8,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    transform: [{ rotate: '-10deg' }],
  },
  wave2: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -50,
    width: width * 0.6,
    height: 150,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    transform: [{ rotate: '15deg' }],
  },
  wave3: {
    position: 'absolute',
    bottom: height * 0.4,
    left: width * 0.3,
    width: width * 0.4,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    transform: [{ rotate: '5deg' }],
  },
  contentOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 50,
  },
  topTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#1d4ed8',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  quote: {
    fontSize: 12,
    color: '#e0e7ff',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 30,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
