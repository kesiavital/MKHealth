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
import { BASE_URL, USUARIOS_URL } from '../service/api';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // FORMATA CPF
  const formatCPF = (value: string) => {
    const cpfClean = value.replace(/\D/g, '');
    if (cpfClean.length <= 3) return cpfClean;
    if (cpfClean.length <= 6) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    if (cpfClean.length <= 9) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  // REMOVE MÁSCARA
  const limparCPF = (cpf: string) => {
    return cpf.replace(/\D/g, '');
  };

  // FUNÇÃO PARA SALVAR DADOS DO USUÁRIO
  const salvarDadosUsuario = async (token: string, usuario: any) => {
    try {
      console.log('💾 Salvando dados do usuário...');
      
      // Salvar token
      await AsyncStorage.setItem('token', token);
      console.log('✅ Token salvo:', token.substring(0, 30) + '...');
      
      // Salvar usuário
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      console.log('✅ Usuário salvo:', usuario.nome_completo);
      
      // Verificar se salvou corretamente
      const tokenVerificado = await AsyncStorage.getItem('token');
      const usuarioVerificado = await AsyncStorage.getItem('usuario');
      
      if (tokenVerificado && usuarioVerificado) {
        console.log('✅ VERIFICAÇÃO: Dados salvos com sucesso!');
        return true;
      } else {
        console.log('❌ VERIFICAÇÃO: Falha ao salvar dados!');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      return false;
    }
  };

  // LOGIN
  const handleLogin = async () => {
    // Validações
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
      // 🔴 ALTERADO: /logar -> /login (CORRIGIDO)
      const loginUrl = `${USUARIOS_URL}/login`;
      console.log('📡 Conectando ao servidor:', BASE_URL);
      console.log('📡 URL completa:', loginUrl);
      console.log('📡 CPF enviado:', cpfLimpo);
      console.log('📡 Senha enviada:', '***');

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

      console.log('📡 Status da resposta:', response.status);

      const data = await response.json();
      console.log('📡 Resposta do backend:', JSON.stringify(data, null, 2));

      // Tratamento de erros
      if (response.status === 404) {
        Alert.alert('Erro', 'Usuário não encontrado. Verifique seu CPF.');
        return;
      }

      if (response.status === 401) {
        Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
        return;
      }

      if (!response.ok) {
        Alert.alert('Erro', data.erro || 'Erro ao fazer login');
        return;
      }

      // Verificar se o backend retornou os dados necessários
      if (!data.token) {
        console.error('❌ Backend não retornou token!');
        Alert.alert('Erro', 'Resposta do servidor inválida. Tente novamente.');
        return;
      }

      if (!data.usuario) {
        console.error('❌ Backend não retornou dados do usuário!');
        Alert.alert('Erro', 'Resposta do servidor inválida. Tente novamente.');
        return;
      }

      // Salvar dados
      const salvou = await salvarDadosUsuario(data.token, data.usuario);
      
      if (!salvou) {
        Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
        return;
      }

      // Sucesso!
      Alert.alert(
        'Sucesso!',
        `Bem-vindo ${data.usuario.nome_completo || 'Usuário'}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🚀 Redirecionando para Home...');
              router.replace('/(tabs)');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ ERRO no login:', error);
      
      if (error.message === 'Network request failed') {
        Alert.alert(
          'Erro de Conexão',
          `Não foi possível conectar ao servidor.\n\nVerifique:\n• O backend está rodando?\n• IP correto: ${BASE_URL}\n• Mesma rede Wi-Fi\n• Firewall liberado`
        );
      } else if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'A requisição demorou muito tempo. Verifique sua conexão.');
      } else {
        Alert.alert('Erro', error.message || 'Erro interno ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para navegar para o cadastro
  const navigateToRegister = () => {
    console.log('🔵🔵🔵 NAVEGANDO PARA CADASTRO 🔵🔵🔵');
    console.log('🔵 Router disponível:', !!router);
    
    try {
      router.push('/RegisterScreen' as any);
      console.log('✅ Navegação executada com sucesso!');
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      
      try {
        router.push('RegisterScreen' as any);
        console.log('✅ Navegação fallback executada!');
      } catch (error2) {
        console.error('❌ Fallback também falhou:', error2);
        Alert.alert('Erro', 'Não foi possível abrir a tela de cadastro');
      }
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

        {/* CARD DE LOGIN */}
        <View style={styles.card}>
          <Text style={styles.title}>Acesse sua conta</Text>
          <Text style={styles.subtitle}>Consulte seus exames online</Text>

          {/* CAMPO CPF */}
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

          {/* CAMPO SENHA */}
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

          {/* BOTÃO LOGIN */}
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

          {/* ESQUECI SENHA */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push('/esqueci')}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* CADASTRO */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não possui conta?</Text>
            <TouchableOpacity
              onPress={navigateToRegister}
              disabled={loading}
            >
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