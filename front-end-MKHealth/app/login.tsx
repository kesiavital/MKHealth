// app/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { USUARIOS_URL } from '../service/api';
import { saveUserData } from '../service/auth'; // 🔥 IMPORTAR A FUNÇÃO

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formatCPF = (value: string) => {
    const cpfClean = value.replace(/\D/g, '');
    if (cpfClean.length <= 3) return cpfClean;
    if (cpfClean.length <= 6) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    if (cpfClean.length <= 9) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  const limparCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '');
  };

  const handleLogin = async () => {
    if (!cpf.trim()) {
      Alert.alert('Erro', 'Digite seu CPF');
      return;
    }

    const cpfLimpo = limparCPF(cpf);
    if (cpfLimpo.length !== 11) {
      Alert.alert('Erro', 'CPF inválido. Digite 11 números.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Digite sua senha');
      return;
    }

    setLoading(true);

    try {
      const loginUrl = `${USUARIOS_URL}/login`;
      console.log('📡 ====== INICIANDO LOGIN ======');

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          identificador: cpfLimpo,
          senha: password,
        }),
      });

      const data = await response.json();
      console.log('📡 Resposta:', JSON.stringify(data, null, 2));

      if (response.status === 404) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        setLoading(false);
        return;
      }

      if (response.status === 401) {
        Alert.alert('Erro', 'Senha incorreta.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        Alert.alert('Erro', data.erro || 'Erro ao fazer login');
        setLoading(false);
        return;
      }

      if (!data.token || !data.usuario) {
        Alert.alert('Erro', 'Resposta do servidor inválida.');
        setLoading(false);
        return;
      }

      if (data.usuario.tipo_usuario === undefined) {
        data.usuario.tipo_usuario = 0;
      }

      // 🔥 USAR A FUNÇÃO DO AUTH PARA SALVAR
      const salvou = await saveUserData(data.token, data.usuario);
      
      if (!salvou) {
        Alert.alert('Erro', 'Não foi possível salvar seus dados.');
        setLoading(false);
        return;
      }

      // 🔥 VERIFICAR NOVAMENTE ANTES DE REDIRECIONAR
      const tokenFinal = await AsyncStorage.getItem('token');
      const userFinal = await AsyncStorage.getItem('userData');
      
      console.log('🔍 Verificação final antes de redirecionar:');
      console.log('📌 Token existe?', !!tokenFinal);
      console.log('📌 UserData existe?', !!userFinal);

      if (!tokenFinal || !userFinal) {
        console.error('❌ Dados sumiram!');
        Alert.alert('Erro', 'Erro ao salvar dados. Tente novamente.');
        setLoading(false);
        return;
      }

      const tipoDescricao = data.usuario.tipo_usuario === 1 ? 'Médico' : 'Paciente';
      
      Alert.alert(
        'Sucesso!',
        `Bem-vindo ${data.usuario.nome_completo || 'Usuário'}!\n\nTipo: ${tipoDescricao}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🚀 REDIRECIONANDO PARA HOME...');
              // Forçar a navegação
              router.replace('/(tabs)');
            }
          }
        ],
        { cancelable: false }
      );
      
    } catch (error: any) {
      console.error('❌ ERRO no login:', error);
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/admin/RegisterScreen');
  };

  const navigateToRecuperarSenha = () => {
    router.push('/recuperarSenha');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.backgroundCircle} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logomk.png')}
            style={styles.logo}
          />
          <Text style={styles.logoText}>MKHealth</Text>
          <Text style={styles.logoSubtext}>Sistema de Exames</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Acesse sua conta</Text>
          <Text style={styles.subtitle}>Consulte seus exames online</Text>

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="000.000.000-00"
            keyboardType="numeric"
            maxLength={14}
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
            editable={!loading}
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Digite sua senha"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={navigateToRecuperarSenha}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não possui conta?</Text>
            <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
              <Text style={styles.registerLink}> Cadastre-se</Text>
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
    width: 120,
    height: 120,
    resizeMode: 'contain',
    tintColor: '#FFF',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 5,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
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
    fontSize: 16,
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
    fontSize: 16,
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
  buttonDisabled: {
    backgroundColor: '#CC6666',
    opacity: 0.7,
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
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '600',
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