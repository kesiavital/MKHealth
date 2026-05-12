import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// URL do seu backend (mesma do registro)
const API_URL = 'http://10.200.32.246:3000/api';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formatCPF = (value: string) => {
    const cpfClean = value.replace(/[^\d]/g, '');
    if (cpfClean.length <= 3) return cpfClean;
    if (cpfClean.length <= 6) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    if (cpfClean.length <= 9) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  const validateCPF = (cpf: string) => {
    const cpfClean = cpf.replace(/[^\d]/g, '');
    return cpfClean.length === 11;
  };

  const handleLogin = async () => {
    // Validações
    if (!cpf.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu CPF.');
      return;
    }

    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    if (cpfLimpo.length !== 11) {
      Alert.alert('Erro', 'Por favor, digite um CPF válido com 11 dígitos.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha.');
      return;
    }

    setLoading(true);
    try {
      console.log('📡 Tentando login...');
      console.log('📡 URL:', `${API_URL}/login`);
      console.log('📡 CPF:', cpfLimpo);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpfLimpo,
          senha: password
        }),
      });

      const data = await response.json();
      console.log('📡 Resposta:', data);

      if (response.status === 401 || response.status === 404) {
        Alert.alert('Erro', 'CPF ou senha incorretos');
        return;
      }

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao fazer login');
      }

      // Login bem-sucedido
      Alert.alert('Sucesso', `Bem-vindo, ${data.usuario?.nome_completo || 'Usuário'}!`);
      
      // TODO: Salvar dados do usuário se necessário
      // Exemplo: AsyncStorage.setItem('userData', JSON.stringify(data.usuario));
      
      // Redireciona para a tela principal (ajuste conforme sua navegação)
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
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
            source={require('./img/logomk.png')}
            style={styles.logo} 
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Acesse sua conta</Text>
          <Text style={styles.subtitle}>Consulte seus exames online</Text>

          <Text style={styles.label}>CPF</Text>
          <TextInput 
            style={styles.input} 
            placeholder="000.000.000-00"
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
            keyboardType="numeric"
            maxLength={14}
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotButton} 
            onPress={() => router.push('/esqueci')}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Atalho para Cadastro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/RegisterScreen')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B0000' },
  backgroundCircle: {
    position: 'absolute', 
    top: -100, 
    left: -50, 
    width: 400, 
    height: 400,
    borderRadius: 200, 
    backgroundColor: '#A52A2A', 
    opacity: 0.5,
  },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 180, height: 180, tintColor: '#FFF', resizeMode: 'contain' },
  card: {
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 30,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5, marginLeft: 5 },
  input: { 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#E0E0E0' 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
  },
  eyeButton: {
    padding: 15,
  },
  eyeIcon: {
    fontSize: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#8B0000', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#8B0000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 3, 
    elevation: 3,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  forgotButton: { alignItems: 'center', marginTop: 20 },
  forgotText: { color: '#888', fontSize: 14 },
  registerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  registerText: { 
    color: '#666', 
    fontSize: 14 
  },
  registerLink: { 
    color: '#8B0000', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
});