// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const verificarLogin = async () => {
      try {
        console.log('🔍 ========================================');
        console.log('🔍 VERIFICANDO AUTENTICAÇÃO');
        console.log('🔍 ========================================');
        
        // Aguardar um pouco para garantir que o storage foi atualizado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const token = await AsyncStorage.getItem('token');
        const usuario = await AsyncStorage.getItem('usuario');
        
        console.log('🔑 Token:', token ? '✅ Presente' : '❌ Ausente');
        console.log('👤 Usuário:', usuario ? '✅ Presente' : '❌ Ausente');
        
        if (token && usuario) {
          console.log('✅ Usuário autenticado → HOME');
          router.replace('/(tabs)');
        } else {
          console.log('❌ Usuário NÃO autenticado → LOGIN');
          router.replace('/login');
        }
      } catch (error) {
        console.error('❌ Erro:', error);
        router.replace('/login');
      } finally {
        setIsReady(true);
      }
    };

    verificarLogin();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Image
          source={require('../assets/images/logomk.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>MK Health</Text>
        <Text style={styles.subtitle}>Sua saúde em primeiro lugar</Text>
        <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
        <Text style={styles.loadingText}>
          Verificando autenticação...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    tintColor: '#FFF',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 50,
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 15,
    fontSize: 14,
  },
});