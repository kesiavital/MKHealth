// app/recuperarSenha.tsx
import { Ionicons } from '@expo/vector-icons';
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
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [codigo, setCodigo] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<'sucesso' | 'erro' | 'info' | 'confirmacao'>('info');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalBotaoTexto, setModalBotaoTexto] = useState('OK');
  const [modalAcao, setModalAcao] = useState<(() => void) | null>(null);
  const [modalBotaoSecundario, setModalBotaoSecundario] = useState<{ texto: string; acao: () => void } | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const handleVerificarEmail = async () => {
    if (!email.trim()) {
      abrirModal(
        'erro',
        'Campo Vazio',
        'Por favor, digite seu e-mail para continuar.'
      );
      return;
    }

    if (!validateEmail(email.trim())) {
      abrirModal(
        'erro',
        'E-mail Inválido',
        'Por favor, digite um endereço de e-mail válido.\n\nExemplo: usuario@email.com'
      );
      return;
    }

    setLoading(true);

    try {
      const url = `${USUARIOS_URL}/verificar-email`;
      
      console.log('Verificando email:', email.trim());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        }),
      });

      const data = await response.json();
      console.log('Resposta:', data);

      if (response.status === 404) {
        abrirModal(
          'erro',
          'E-mail não encontrado',
          'Este e-mail não está cadastrado em nossa base de dados.\n\nVerifique o e-mail informado e tente novamente.',
          'Tentar Novamente',
          undefined,
          {
            texto: 'Voltar ao Login',
            acao: () => router.replace('/login')
          }
        );
        setLoading(false);
        return;
      }

      if (!response.ok) {
        abrirModal(
          'erro',
          'Erro na Verificação',
          data.erro || 'Ocorreu um erro ao verificar seu e-mail. Tente novamente.'
        );
        setLoading(false);
        return;
      }

      // Se deu tudo certo, a API já disparou o e-mail. Vamos avisar o usuário.
      abrirModal(
        'info',
        '📧 E-mail Enviado!',
        'Enviamos um código de verificação para o seu e-mail. Lembre-se de verificar a caixa de spam.',
        'ENTENDI, IR PARA O PASSO 2',
        () => setStep(2)
      );

    } catch (error: any) {
      console.error('Erro:', error);
      abrirModal(
        'erro',
        'Erro de Conexão',
        'Não foi possível conectar ao servidor.\n\nVerifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async () => {
    if (!codigo.trim()) {
      abrirModal('erro', 'Código Obrigatório', 'Por favor, digite o código de verificação recebido no seu e-mail.');
      return;
    }

    if (!novaSenha.trim()) {
      abrirModal('erro', 'Senha Obrigatória', 'Por favor, digite sua nova senha.');
      return;
    }

    if (novaSenha.length < 4) {
      abrirModal('erro', 'Senha Fraca', 'A senha deve ter pelo menos 4 caracteres.\n\nEscolha uma senha mais segura.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      abrirModal('erro', 'Senhas não coincidem', 'As senhas digitadas não são iguais.\n\nPor favor, digite a mesma senha nos dois campos.');
      return;
    }

    setLoading(true);

    try {
      const url = `${USUARIOS_URL}/redefinir-senha`;
      
      console.log('📡 Redefinindo senha para:', email.trim());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          nova_senha: novaSenha,
          codigo: codigo // O backend que vai verificar se o código bate!
        }),
      });

      const data = await response.json();
      console.log('📡 Resposta:', data);

      if (!response.ok) {
        // Se a API retornar erro (ex: código inválido ou expirado)
        abrirModal(
          'erro',
          'Erro ao Redefinir',
          data.erro || 'Ocorreu um erro ao redefinir sua senha. Verifique o código e tente novamente.'
        );
        setLoading(false);
        return;
      }

      abrirModal(
        'sucesso',
        'Senha Redefinida!',
        'Sua senha foi redefinida com sucesso!\n\nAgora você pode fazer login com sua nova senha.',
        'Ir para Login',
        () => router.replace('/login')
      );

    } catch (error: any) {
      console.error('Erro:', error);
      abrirModal(
        'erro',
        'Erro de Conexão',
        'Não foi possível conectar ao servidor.\n\nVerifique sua conexão e tente novamente.'
      );
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
  };

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
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('../assets/images/logomk.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            {step === 1 ? 'Recuperar Senha' : 'Nova Senha'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Digite seu e-mail cadastrado para receber o código de verificação' 
              : 'Digite o código recebido no e-mail e sua nova senha'
            }
          </Text>

          {step === 1 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail Cadastrado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
                <Text style={styles.helperText}>
                  Digite o e-mail utilizado no cadastro
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerificarEmail}
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

          {step === 2 && (
            <>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepIndicatorText}>Passo 2 de 2</Text>
              </View>

              <View style={styles.emailInfo}>
                <Text style={styles.emailInfoText}>📧 E-mail verificado: {email}</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.codigoHeader}>
                  <Text style={styles.label}>Código de Verificação</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o código recebido por e-mail"
                  placeholderTextColor="#999"
                  value={codigo}
                  onChangeText={setCodigo}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nova Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Digite a nova senha (mín. 4 caracteres)"
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
              </View>

              <View style={styles.inputContainer}>
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
              </View>

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

      {/* MODAL UNIVERSAL */}
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

              {modalMensagem !== '' && (
                <Text style={[
                  styles.modalMensagem,
                  modalTipo === 'sucesso' && styles.modalMensagemSuccess,
                  modalTipo === 'erro' && styles.modalMensagemError,
                ]}>
                  {modalMensagem}
                </Text>
              )}

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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 160,
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
  inputContainer: {
    marginBottom: 18,
  },
  codigoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginLeft: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 15,
  },
  eyeIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8B0000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CC6666',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
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
  emailInfo: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  emailInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
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