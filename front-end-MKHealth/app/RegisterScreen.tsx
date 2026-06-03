import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import IP from '../service/api';
// URL do seu backend - ALTERE PARA O IP DO SEU COMPUTADOR
const API_URL = `http://${IP}/api/usuarios`;

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  
  // Campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateCPF = (cpf: string): boolean => {
    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(cpfClean)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfClean.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfClean.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfClean.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfClean.charAt(10))) return false;
    
    return true;
  };

  const formatCPF = (value: string): string => {
    const cpfClean = value.replace(/[^\d]/g, '');
    if (cpfClean.length <= 3) return cpfClean;
    if (cpfClean.length <= 6) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    if (cpfClean.length <= 9) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  // Função para testar conexão com o servidor
  const testServerConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testando conexão com o servidor...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(API_URL, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('✅ Servidor respondendo na porta 3000');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Servidor não responde:', errorMessage);
      return false;
    }
  };

  const handleRegister = async (): Promise<void> => {
    // Validações
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu nome completo.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, digite um e-mail válido.');
      return;
    }

    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'Por favor, digite um CPF válido.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setLoading(true);
    
    // Testar conexão primeiro
    const isConnected = await testServerConnection();
    if (!isConnected) {
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor.\n\nVerifique:\n✓ O backend está rodando (npm start)\n✓ O IP está correto: ' + API_URL + '\n✓ Celular e computador estão na mesma rede Wi-Fi\n✓ Firewall não está bloqueando a porta 3000'
      );
      setLoading(false);
      return;
    }

    try {
      const cpfLimpo = cpf.replace(/[^\d]/g, '');
      
      console.log('📡 Enviando requisição POST...');
      console.log('📡 URL:', `${API_URL}/`);
      console.log('📡 Dados:', {
        nome_completo: name.trim(),
        email: email.trim(),
        cpf: cpfLimpo,
        senha: '***'
      });
      
      // Timeout de 15 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          nome_completo: name.trim(),
          email: email.trim(),
          cpf: cpfLimpo,
          senha: password
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Status da resposta:', response.status);
      
      // Verifica se a resposta tem conteúdo
      const textResponse = await response.text();
      console.log('📡 Resposta RAW:', textResponse);
      
      if (!textResponse || textResponse.trim() === '') {
        throw new Error('Servidor retornou resposta vazia.');
      }
      
      // Tenta fazer o parse do JSON
      let data: any;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError: unknown) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        throw new Error('Resposta do servidor inválida.');
      }
      
      // Tratamento de erros baseado no status
      if (response.status === 400) {
        Alert.alert('Erro de Validação', data.erro || 'Dados inválidos');
        return;
      }
      
      if (response.status === 409) {
        Alert.alert('Erro', data.erro || 'Email ou CPF já cadastrado');
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.erro || `Erro ${response.status}: Falha ao cadastrar`);
      }
      
      // Sucesso!
      Alert.alert(
        'Sucesso!', 
        data.mensagem || 'Cadastro realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/')
          }
        ]
      );
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorName = error instanceof Error ? error.name : '';
      
      console.error('❌ Erro detalhado:', error);
      
      // Tratamento específico para diferentes erros
      if (errorName === 'AbortError') {
        Alert.alert(
          'Timeout', 
          'A requisição demorou muito tempo. Verifique sua conexão.'
        );
      } else if (errorMessage === 'Network request failed') {
        Alert.alert(
          'Erro de Rede',
          'Não foi possível conectar ao servidor.\n\nVerifique:\n✓ O backend está rodando\n✓ O IP está correto: ' + API_URL + '\n✓ O celular está na mesma rede Wi-Fi\n✓ O firewall não está bloqueando a porta 3000'
        );
      } else {
        Alert.alert('Erro', errorMessage || 'Erro ao realizar cadastro.');
      }
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('./img/logomk.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Cadastre-se para acessar seus exames</Text>

          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

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

          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>CADASTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/')}>
            <Text style={styles.loginText}>Já tenho conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B0000'
  },
  backgroundCircle: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#A52A2A',
    opacity: 0.5
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 40
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10
  },
  logo: {
    width: 120,
    height: 120,
    tintColor: '#FFF',
    resizeMode: 'contain'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    marginLeft: 5
  },
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
    marginBottom: 20
  },
  passwordInput: {
    flex: 1,
    padding: 15
  },
  eyeButton: {
    padding: 15
  },
  eyeIcon: {
    fontSize: 20,
    color: '#666'
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
      height: 2
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 20
  },
  loginText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: 'bold'
  }
});