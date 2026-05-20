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
  View,
} from 'react-native';

// URL do backend
const API_URL = 'http://10.16.136.95:3000/api';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // FORMATA CPF
  const formatCPF = (value: string) => {
    const cpfClean = value.replace(/\D/g, '');

    if (cpfClean.length <= 3) return cpfClean;

    if (cpfClean.length <= 6) {
      return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    }

    if (cpfClean.length <= 9) {
      return `${cpfClean.slice(0, 3)}.${cpfClean.slice(
        3,
        6
      )}.${cpfClean.slice(6)}`;
    }

    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(
      3,
      6
    )}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  // REMOVE MÁSCARA
  const limparCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '');
  };

  // LOGIN
  const handleLogin = async () => {
    try {
      if (!cpf.trim()) {
        Alert.alert('Erro', 'Digite seu CPF');
        return;
      }

      const cpfLimpo = limparCPF(cpf);

      if (cpfLimpo.length !== 11) {
        Alert.alert('Erro', 'CPF inválido');
        return;
      }

      if (!password.trim()) {
        Alert.alert('Erro', 'Digite sua senha');
        return;
      }

      setLoading(true);

      console.log('📡 Iniciando login...');
      console.log('📡 URL:', `${API_URL}/login`);

      const bodyData = {
        identificador: cpfLimpo,
        senha: password,
      };

      console.log('📡 Body:', bodyData);

      const response = await fetch(`${API_URL}/usuarios/logar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identificador: cpfLimpo,
          senha: password,
        }),
      });

      console.log('📡 Status:', response.status);

      const data = await response.json();

      console.log('📡 Resposta backend:', data);

      // ERROS
      if (response.status === 404) {
        Alert.alert('Erro', 'Usuário não encontrado');
        return;
      }

      if (response.status === 401) {
        Alert.alert('Erro', 'Senha incorreta');
        return;
      }

      if (!response.ok) {
        Alert.alert('Erro', data.erro || 'Erro ao fazer login');
        return;
      }

      // SUCESSO
      Alert.alert(
        'Sucesso',
        `Bem-vindo ${data.usuario?.nome_completo || 'Usuário'}`
      );

      /*
      SALVAR TOKEN FUTURAMENTE

      import AsyncStorage from '@react-native-async-storage/async-storage';

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(data.usuario));
      */

      // REDIRECIONA
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('❌ ERRO LOGIN:', error);

      if (error.message === 'Network request failed') {
        Alert.alert(
          'Erro de conexão',
          'Não foi possível conectar ao servidor'
        );
      } else {
        Alert.alert(
          'Erro',
          error.message || 'Erro interno ao fazer login'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <View style={styles.backgroundCircle} />

      <View style={styles.content}>
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image
            source={require('./img/logomk.png')}
            style={styles.logo}
          />
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.title}>Acesse sua conta</Text>

          <Text style={styles.subtitle}>
            Consulte seus exames online
          </Text>

          {/* CPF */}
          <Text style={styles.label}>CPF</Text>

          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
          />

          {/* SENHA */}
          <Text style={styles.label}>Senha</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Digite sua senha"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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

          {/* BOTÃO LOGIN */}
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

          {/* ESQUECI SENHA */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push('/esqueci')}
          >
            <Text style={styles.forgotText}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>

          {/* CADASTRO */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Não possui conta?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/RegisterScreen')}
            >
              <Text style={styles.registerLink}>
                {' '}
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000',
  },

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

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    tintColor: '#FFF',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    marginLeft: 5,
  },

  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    paddingHorizontal: 15,
  },

  eyeIcon: {
    fontSize: 20,
  },

  button: {
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,

    shadowColor: '#8B0000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,

    elevation: 3,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  forgotButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  forgotText: {
    color: '#777',
    fontSize: 14,
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  registerText: {
    color: '#666',
    fontSize: 14,
  },

  registerLink: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});