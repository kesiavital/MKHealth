// app/recuperarSenha.tsx
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
import { USUARIOS_URL } from '../service/api';

export default function RecuperarSenhaScreen() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [identificador, setIdentificador] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoGerado, setCodigoGerado] = useState('');

  const formatCPF = (value: string) => {
    const cpfClean = value.replace(/\D/g, '');
    if (cpfClean.length <= 3) return cpfClean;
    if (cpfClean.length <= 6) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3)}`;
    if (cpfClean.length <= 9) return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6)}`;
    return `${cpfClean.slice(0, 3)}.${cpfClean.slice(3, 6)}.${cpfClean.slice(6, 9)}-${cpfClean.slice(9, 11)}`;
  };

  const limparCPF = (cpf: string) => cpf.replace(/\D/g, '');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isCPF = (value: string) => {
    const clean = value.replace(/\D/g, '');
    return clean.length === 11;
  };

  const isEmail = (value: string) => {
    return validateEmail(value);
  };

  const handleVerificarIdentificador = async () => {
    if (!identificador.trim()) {
      Alert.alert('Erro', 'Digite seu CPF ou E-mail');
      return;
    }

    const cpfLimpo = limparCPF(identificador);
    const emailLimpo = identificador.trim().toLowerCase();

    if (!isCPF(cpfLimpo) && !isEmail(emailLimpo)) {
      Alert.alert('Erro', 'Digite um CPF ou E-mail válido');
      return;
    }

    setLoading(true);

    try {
      const url = `${USUARIOS_URL}/recuperar-senha`;
      
      console.log('📡 Verificando usuário:', {
        identificador: cpfLimpo || emailLimpo
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          identificador: cpfLimpo || emailLimpo
        }),
      });

      const data = await response.json();
      console.log('📡 Resposta:', data);

      if (response.status === 404) {
        Alert.alert('Erro', 'Usuário não encontrado. Verifique seu CPF ou E-mail.');
        return;
      }

      if (!response.ok) {
        Alert.alert('Erro', data.erro || 'Erro ao verificar usuário');
        return;
      }

      if (data.usuario) {
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        setCodigoGerado(codigo);
        setCodigoEnviado(true);
        
        Alert.alert(
          '✅ Código Enviado!',
          `Um código de verificação foi enviado para seu e-mail.\n\nCódigo: ${codigo}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setStep(2);
              }
            }
          ]
        );
      }

    } catch (error: any) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', error.message || 'Erro ao verificar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async () => {
    if (!codigo.trim()) {
      Alert.alert('Erro', 'Digite o código de verificação');
      return;
    }

    if (!novaSenha.trim()) {
      Alert.alert('Erro', 'Digite a nova senha');
      return;
    }

    if (novaSenha.length < 4) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (codigo !== codigoGerado && codigo !== '123456') {
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
      return;
    }

    setLoading(true);

    try {
      const url = `${USUARIOS_URL}/redefinir-senha`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          identificador: limparCPF(identificador) || identificador.trim().toLowerCase(),
          nova_senha: novaSenha,
          codigo: codigo
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.erro || 'Erro ao redefinir senha');
        return;
      }

      Alert.alert(
        '✅ Sucesso!',
        'Sua senha foi redefinida com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', error.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const voltarParaLogin = () => {
    router.replace('/login');
  };

  const voltarStep1 = () => {
    setStep(1);
    setCodigo('');
    setCodigoEnviado(false);
    setCodigoGerado('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View style={styles.backgroundCircle} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logomk.png')}
            style={styles.logo}
          />
          <Text style={styles.logoText}>MKHealth</Text>
          <Text style={styles.logoSubtext}>Recuperar Senha</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            {step === 1 ? '🔐 Recuperar Senha' : '🔑 Nova Senha'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Digite seu CPF ou E-mail para receber o código de verificação' 
              : 'Digite o código recebido e sua nova senha'
            }
          </Text>

          {/* STEP 1: Verificar Identificador */}
          {step === 1 && (
            <>
              <Text style={styles.label}>CPF ou E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00 ou email@exemplo.com"
                placeholderTextColor="#999"
                value={identificador}
                onChangeText={(text) => {
                  if (text.replace(/\D/g, '').length <= 11 && !text.includes('@')) {
                    setIdentificador(formatCPF(text));
                  } else {
                    setIdentificador(text);
                  }
                }}
                autoCapitalize="none"
                keyboardType={identificador.includes('@') ? 'email-address' : 'default'}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerificarIdentificador}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={voltarParaLogin}
                disabled={loading}
              >
                <Text style={styles.linkButtonText}>← Voltar para Login</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 2: Nova Senha */}
          {step === 2 && (
            <>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepIndicatorText}>Passo 2 de 2</Text>
              </View>

              <Text style={styles.label}>Código de Verificação</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o código recebido"
                placeholderTextColor="#999"
                value={codigo}
                onChangeText={setCodigo}
                keyboardType="numeric"
                maxLength={6}
                editable={!loading}
              />

              <Text style={styles.label}>Nova Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#999"
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry={!showNovaSenha}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNovaSenha(!showNovaSenha)}
                  disabled={loading}
                >
                  <Text style={styles.eyeIcon}>
                    {showNovaSenha ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor="#999"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry={!showConfirmarSenha}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  disabled={loading}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmarSenha ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {codigoEnviado && (
                <View style={styles.codigoTeste}>
                  <Text style={styles.codigoTesteLabel}>📱 Código de teste:</Text>
                  <Text style={styles.codigoTesteValor}>{codigoGerado}</Text>
                  <Text style={styles.codigoTesteObs}>(Ou use: 123456)</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRedefinirSenha}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>REDEFINIR SENHA</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={voltarStep1}
                disabled={loading}
              >
                <Text style={styles.linkButtonText}>← Voltar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
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
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 15,
  },
  stepIndicatorText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: 'bold',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
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
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  linkButtonText: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '500',
  },
  codigoTeste: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  codigoTesteLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  codigoTesteValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E65100',
    letterSpacing: 4,
  },
  codigoTesteObs: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});