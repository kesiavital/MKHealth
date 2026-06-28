// app/login.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { USUARIOS_URL } from '../service/api';
import { saveUserData, STORAGE_KEYS } from '../service/auth';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 STATES DOS MODAIS
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<'sucesso' | 'erro' | 'info' | 'confirmacao'>('info');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalBotaoTexto, setModalBotaoTexto] = useState('OK');
  const [modalAcao, setModalAcao] = useState<(() => void) | null>(null);
  const [modalBotaoSecundario, setModalBotaoSecundario] = useState<{ texto: string; acao: () => void } | null>(null);

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

  // 🔥 FUNÇÕES PARA ABRIR MODAIS
  const abrirModal = (
    tipo: 'sucesso' | 'erro' | 'info' | 'confirmacao',
    titulo: string,
    mensagem: string,
    botaoTexto: string = 'OK',
    acao?: () => void,
    botaoSecundario?: { texto: string; acao: () => void }
  ) => {
    setModalTipo(tipo);
    setModalTitulo(titulo);
    setModalMensagem(mensagem);
    setModalBotaoTexto(botaoTexto);
    setModalAcao(() => acao || null);
    setModalBotaoSecundario(botaoSecundario || null);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    if (modalAcao) {
      modalAcao();
    }
  };

  const handleLogin = async () => {
    // Validação CPF
    if (!cpf.trim()) {
      abrirModal('erro', '⚠️ Campo Vazio', 'Por favor, digite seu CPF para continuar.');
      return;
    }

    const cpfLimpo = limparCPF(cpf);
    if (cpfLimpo.length !== 11) {
      abrirModal('erro', '📄 CPF Inválido', 'O CPF deve conter 11 números.\n\nExemplo: 123.456.789-00');
      return;
    }

    // Validação Senha
    if (!password.trim()) {
      abrirModal('erro', '🔒 Campo Vazio', 'Por favor, digite sua senha para continuar.');
      return;
    }

    setLoading(true);

    try {
      const loginUrl = `${USUARIOS_URL}/login`;
      console.log('📡 ====== INICIANDO LOGIN ======');
      console.log('📡 URL:', loginUrl);
      console.log('📡 CPF:', cpfLimpo);

      // ===== 1. FAZ REQUISIÇÃO PARA O BACKEND =====
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
      console.log('📡 Resposta status:', response.status);
      console.log('📡 Resposta data:', JSON.stringify(data, null, 2));

      // ===== 2. TRATAMENTO DE ERROS =====
      if (response.status === 404) {
        abrirModal(
          'erro',
          '🔍 Usuário não encontrado',
          'Não encontramos um usuário com este CPF.\n\nVerifique o CPF informado e tente novamente.',
          'Tentar Novamente',
          undefined,
          {
            texto: 'Criar Conta',
            acao: () => navigateToRegister()
          }
        );
        setLoading(false);
        return;
      }

      if (response.status === 401) {
        abrirModal(
          'erro',
          '🔒 Senha incorreta',
          'A senha informada está incorreta.\n\nVerifique sua senha e tente novamente.',
          'Tentar Novamente',
          undefined,
          {
            texto: 'Esqueci minha senha',
            acao: () => navigateToRecuperarSenha()
          }
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        abrirModal('erro', '❌ Erro no Login', data.erro || 'Ocorreu um erro ao fazer login. Tente novamente.');
        setLoading(false);
        return;
      }

      // ===== 3. VERIFICA SE VEIO O TOKEN =====
      if (!data.token || !data.usuario) {
        console.error('❌ Dados incompletos:', data);
        abrirModal('erro', '❌ Resposta Inválida', 'O servidor retornou uma resposta inválida.\n\nTente novamente mais tarde.');
        setLoading(false);
        return;
      }

      // Garantir que tipo_usuario existe
      if (data.usuario.tipo_usuario === undefined) {
        data.usuario.tipo_usuario = 0; // Padrão: Paciente
      }

      console.log('🔑 Token recebido do BACKEND:', data.token.substring(0, 30) + '...');
      console.log('👤 Usuário:', data.usuario);

      // ===== 4. SALVA O TOKEN QUE VEIO DO BACKEND =====
      const salvou = await saveUserData(data.token, data.usuario);
      
      if (!salvou) {
        abrirModal('erro', '❌ Erro ao Salvar', 'Não foi possível salvar seus dados localmente.');
        setLoading(false);
        return;
      }

      // ===== 5. VERIFICA SE SALVOU CORRETAMENTE =====
      const tokenSalvo = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userSalvo = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      console.log('🔍 Verificação final:');
      console.log('📌 Token salvo?', !!tokenSalvo);
      console.log('📌 Token:', tokenSalvo?.substring(0, 30) + '...');
      console.log('📌 UserData salvo?', !!userSalvo);
      console.log('📌 UserData:', userSalvo ? JSON.parse(userSalvo) : null);

      if (!tokenSalvo || !userSalvo) {
        console.error('❌ Falha na verificação dos dados salvos!');
        abrirModal('erro', '❌ Erro ao Salvar', 'Erro ao salvar seus dados. Tente novamente.');
        setLoading(false);
        return;
      }

      // ===== 6. SUCESSO! REDIRECIONA =====
      const tipoDescricao = data.usuario.tipo_usuario === 1 ? 'Médico' : 'Paciente';
      
      console.log('✅ Login realizado com sucesso!');
      console.log(`👤 Tipo: ${tipoDescricao}`);
      console.log('🚀 Redirecionando para home...');
      
      abrirModal(
        'sucesso',
        '✅ Login Realizado!',
        `Bem-vindo ${data.usuario.nome_completo || 'Usuário'}!\n\n👤 Tipo: ${tipoDescricao}`,
        'ENTRAR',
        () => {
          console.log('🚀 NAVEGANDO PARA HOME...');
          router.replace('/(tabs)');
        }
      );
      
    } catch (error: any) {
      console.error('❌ ERRO no login:', error);
      abrirModal(
        'erro',
        '❌ Erro de Conexão',
        `Não foi possível conectar ao servidor.\n\nVerifique sua conexão com a internet.\n\nDetalhe: ${error.message || 'Erro desconhecido'}`,
        'Tentar Novamente'
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNÇÕES DE NAVEGAÇÃO - IGUAIS
  const navigateToRegister = () => {
    console.log('🚀 Navegando para cadastro...');
    router.push('/admin/RegisterScreen');
  };

  const navigateToRecuperarSenha = () => {
    console.log('🚀 Navegando para recuperar senha...');
    router.push('/recuperarSenha');
  };

  // 🔥 RENDERIZAR ÍCONE DO MODAL
  const renderModalIcon = () => {
    switch (modalTipo) {
      case 'sucesso':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconSuccess]}>
            <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
          </View>
        );
      case 'erro':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconError]}>
            <Ionicons name="alert-circle" size={50} color="#F44336" />
          </View>
        );
      case 'info':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconInfo]}>
            <Ionicons name="information-circle" size={50} color="#2196F3" />
          </View>
        );
      case 'confirmacao':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconConfirm]}>
            <Ionicons name="help-circle" size={50} color="#FF9800" />
          </View>
        );
      default:
        return null;
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

          {/* 🔥 ESQUECI MINHA SENHA - IGUAL */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={navigateToRecuperarSenha}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* 🔥 CADASTRE-SE - IGUAL AO ESQUECI SENHA */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={navigateToRegister}
            disabled={loading}
          >
            <Text style={styles.registerTextLink}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔥 MODAL UNIVERSAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharModal}
      >
        <Pressable style={styles.modalOverlay} onPress={fecharModal}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalIconContainer}>
                {renderModalIcon()}
              </View>

              <Text style={[
                styles.modalTitle,
                modalTipo === 'sucesso' && styles.modalTitleSuccess,
                modalTipo === 'erro' && styles.modalTitleError,
                modalTipo === 'info' && styles.modalTitleInfo,
                modalTipo === 'confirmacao' && styles.modalTitleConfirm,
              ]}>
                {modalTitulo}
              </Text>

              <Text style={[
                styles.modalMensagem,
                modalTipo === 'sucesso' && styles.modalMensagemSuccess,
                modalTipo === 'erro' && styles.modalMensagemError,
              ]}>
                {modalMensagem}
              </Text>

              <View style={styles.modalBotoesContainer}>
                {modalBotaoSecundario && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecundario]}
                    onPress={() => {
                      setModalVisible(false);
                      modalBotaoSecundario?.acao();
                    }}
                  >
                    <Text style={[styles.modalButtonText, styles.modalButtonTextSecundario]}>
                      {modalBotaoSecundario.texto}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    modalTipo === 'sucesso' && styles.modalButtonSuccess,
                    modalTipo === 'erro' && styles.modalButtonError,
                    modalTipo === 'info' && styles.modalButtonInfo,
                    modalTipo === 'confirmacao' && styles.modalButtonConfirm,
                    modalBotaoSecundario && styles.modalButtonPrincipal,
                  ]}
                  onPress={fecharModal}
                >
                  <Text style={styles.modalButtonText}>{modalBotaoTexto}</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  // 🔥 CADASTRO - IGUAL AO ESQUECI SENHA
  registerButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  registerTextLink: {
    color: '#8B0000',
    fontSize: 14,
    fontWeight: '600',
  },

  // 🔥 ESTILOS DO MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  modalIconSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  modalIconError: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  modalIconInfo: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  modalIconConfirm: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalTitleSuccess: {
    color: '#2E7D32',
  },
  modalTitleError: {
    color: '#C62828',
  },
  modalTitleInfo: {
    color: '#0D47A1',
  },
  modalTitleConfirm: {
    color: '#E65100',
  },
  modalMensagem: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalMensagemSuccess: {
    color: '#1B5E20',
  },
  modalMensagemError: {
    color: '#B71C1C',
  },
  modalBotoesContainer: {
    width: '100%',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  modalButtonError: {
    backgroundColor: '#F44336',
  },
  modalButtonInfo: {
    backgroundColor: '#2196F3',
  },
  modalButtonConfirm: {
    backgroundColor: '#FF9800',
  },
  modalButtonPrincipal: {
    marginTop: 5,
  },
  modalButtonSecundario: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalButtonTextSecundario: {
    color: '#666',
  },
});