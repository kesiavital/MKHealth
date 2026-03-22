import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const usuarioDigitado = user.trim().toLowerCase();
    const senhaDigitada = password.trim();

    if (usuarioDigitado === 'admin' && senhaDigitada === '1234') {
      Alert.alert('Bem-vindo', 'Acesso Administrativo liberado.');
      router.replace('/admin'); 
      return;
    }

    if (user.length > 0) {
      router.replace('/(tabs)'); 
    } else {
      Alert.alert('Erro', 'Por favor, digite seu usuário ou CPF.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.backgroundCircle} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
            <Image 
              source={require('./img/logomk.png')} //imagem local da logo
              style={styles.logo} 
            />
          
        </View>

        <View style={styles.card}>
            <Text style={styles.title}>Acesse sua conta</Text>
            <Text style={styles.subtitle}>Consulte seus exames online</Text>

            <Text style={styles.label}>Usuário ou CPF</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite seu CPF"
              value={user}
              onChangeText={setUser}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>ENTRAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/esqueci')}>
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B0000' },
  backgroundCircle: {
    position: 'absolute', top: -100, left: -50, width: 400, height: 400,
    borderRadius: 200, backgroundColor: '#A52A2A', opacity: 0.5,
  },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 }, //margem da logo
  
  
  logo: { width: 180, height: 180, tintColor: '#FFF', resizeMode: 'contain' }, //tamanho da logo
  
  
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5, marginLeft: 5 },
  input: { 
    backgroundColor: '#F5F5F5', borderRadius: 10, padding: 15, marginBottom: 20, 
    borderWidth: 1, borderColor: '#E0E0E0' 
  },
  button: {
    backgroundColor: '#8B0000', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10,
    shadowColor: '#8B0000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 3,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  forgotButton: { alignItems: 'center', marginTop: 20 },
  forgotText: { color: '#888', fontSize: 14 },
});