// app/(tabs)/cadastro-exame.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IP from '../../service/api';

const API_URL = `http://${IP}:3000/api/exames`;

const TIPOS_EXAME = [
  'Check-Up Preventivo', 'Check-Up Gym', 'Check-Up Veggie', 'Check-Up Sono', 'Check-Up Cardio',
   'Outro',
];

const MEDICOS = [
  'Dr. Cesar Florencio - Patologista Clinico',
  'Dra. Helena Vital - Farmaceutica-Bioquimica',
  'Dr. Hallef Magno - Biomédico',
  'Dr. Samuel Vital - Patologista Clinico',
  'Dr. Ezequias Careirro - Biomédico',
  'Outro',
];

const LABORATORIOS = [
  'Lab Vitalle - Patologia Clinica',
  'Outro',
];

interface AttachmentFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function CadastroExameScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    paciente_cpf: '', 
    tipo_exame: '',
    data_exame: new Date(),
    medico_solicitante: '',
    laboratorio: '',
    resultados: '',
    observacoes: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTipoSelect, setShowTipoSelect] = useState(false);
  const [showMedicoSelect, setShowMedicoSelect] = useState(false);
  const [showLaboratorioSelect, setShowLaboratorioSelect] = useState(false);
  const [tipoCustom, setTipoCustom] = useState(false);
  const [medicoCustom, setMedicoCustom] = useState(false);
  const [laboratorioCustom, setLaboratorioCustom] = useState(false);
  
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<'sucesso' | 'erro' | 'info' | 'confirmacao'>('info');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalBotaoTexto, setModalBotaoTexto] = useState('OK');
  const [modalAcao, setModalAcao] = useState<(() => void) | null>(null);
  const [modalBotaoSecundario, setModalBotaoSecundario] = useState<{ texto: string; acao: () => void } | null>(null);

  useEffect(() => {
    verificarAcesso();
  }, []);

  const verificarAcesso = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData?.tipo_usuario !== 1) {
          abrirModal(
            'erro',
            'Acesso Negado',
            'Apenas médicos podem cadastrar exames.',
            'OK',
            () => router.replace('/(tabs)')
          );
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } else {
        abrirModal(
          'erro',
          'Não Logado',
          'Você precisa estar logado para acessar esta tela.',
          'Ir para Login',
          () => router.replace('/login')
        );
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
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

  const aplicarMascaraCPF = (texto: string) => {
    const apenasNumeros = texto.replace(/\D/g, ''); 
    return apenasNumeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); 
  };

  const formatarDataExibicao = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataAPI = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const formatarTamanhoArquivo = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selecionarPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        setAttachment({
          uri: file.uri,
          name: file.name,
          size: file.size || 0,
          mimeType: 'application/pdf',
        });
        abrirModal('sucesso', '✅ PDF Selecionado', `Arquivo "${file.name}" selecionado com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao selecionar PDF:', error);
      abrirModal('erro', 'Erro', 'Não foi possível selecionar o PDF');
    }
  };

  const removerPDF = () => {
    setAttachment(null);
  };

  const salvarExame = async () => {
    if (!formData.paciente_cpf.trim() || formData.paciente_cpf.length < 14) {
      abrirModal('erro', 'Campo Obrigatório', 'Digite um CPF válido (11 dígitos)');
      return;
    }
    if (!formData.tipo_exame.trim()) {
      abrirModal('erro', 'Campo Obrigatório', 'Tipo de exame é obrigatório');
      return;
    }
    if (!formData.medico_solicitante.trim()) {
      abrirModal('erro', 'Campo Obrigatório', 'Médico solicitante é obrigatório');
      return;
    }
    if (!formData.laboratorio.trim()) {
      abrirModal('erro', 'Campo Obrigatório', 'Laboratório é obrigatório');
      return;
    }

    setSaving(true);
    setUploadingFile(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('paciente_cpf', formData.paciente_cpf);
      formDataToSend.append('tipo_exame', formData.tipo_exame.trim());
      formDataToSend.append('data_exame', formatarDataAPI(formData.data_exame));
      formDataToSend.append('medico_solicitante', formData.medico_solicitante.trim());
      formDataToSend.append('laboratorio', formData.laboratorio.trim());
      
      if (formData.resultados) {
        formDataToSend.append('resultados', formData.resultados);
      }
      if (formData.observacoes) {
        formDataToSend.append('observacoes', formData.observacoes);
      }

      if (attachment) {
        const fileToUpload = {
          uri: attachment.uri,
          type: attachment.mimeType,
          name: attachment.name,
        } as any;
        formDataToSend.append('pdf', fileToUpload);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao cadastrar exame');
      }

      abrirModal(
        'sucesso',
        'Sucesso!',
        attachment ? 'Exame cadastrado com PDF anexado!' : 'Exame cadastrado com sucesso!',
        'OK',
        () => {
          setFormData({
            paciente_cpf: '',
            tipo_exame: '',
            data_exame: new Date(),
            medico_solicitante: '',
            laboratorio: '',
            resultados: '',
            observacoes: '',
          });
          setAttachment(null);
          setTipoCustom(false);
          setMedicoCustom(false);
          setLaboratorioCustom(false);
        }
      );
      
    } catch (error: any) {
      console.error('Erro:', error);
      abrirModal('erro', 'Erro', error.message || 'Não foi possível cadastrar o exame');
    } finally {
      setSaving(false);
      setUploadingFile(false);
    }
  };

  const renderModalIcon = () => {
    switch (modalTipo) {
      case 'sucesso':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconSuccess]}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
          </View>
        );
      case 'erro':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconError]}>
            <MaterialCommunityIcons name="alert-circle" size={50} color="#F44336" />
          </View>
        );
      case 'info':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconInfo]}>
            <MaterialCommunityIcons name="information" size={50} color="#2196F3" />
          </View>
        );
      case 'confirmacao':
        return (
          <View style={[styles.modalIconCircle, styles.modalIconConfirm]}>
            <MaterialCommunityIcons name="help-circle" size={50} color="#FF9800" />
          </View>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Verificando permissões...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER COM COR SÓLIDA E LOGO REMOVIDA */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="file-plus" size={40} color="#FFD700" />
            </View>
            <Text style={styles.headerTitle}>Cadastrar Exame</Text>
            <Text style={styles.headerSubtitle}>Preencha todos os campos obrigatórios (*)</Text>
          </View>

          {/*FORMULÁRIO */}
          <View style={styles.formCard}>
            
            {/* CPF do Paciente */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="card-account-details" size={18} color="#8B0000" />
                <Text style={styles.label}>CPF do Paciente <Text style={styles.required}>*</Text></Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={14}
                value={formData.paciente_cpf}
                onChangeText={(text) => setFormData({ ...formData, paciente_cpf: aplicarMascaraCPF(text) })}
              />
            </View>

            {/* Tipo do Exame */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="flask" size={18} color="#8B0000" />
                <Text style={styles.label}>Tipo do Exame <Text style={styles.required}>*</Text></Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowTipoSelect(true)}
              >
                <Text style={[styles.selectButtonText, !formData.tipo_exame && styles.placeholderText]}>
                  {formData.tipo_exame || 'Selecione o tipo de exame'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>

            {/* Data do Exame */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="calendar" size={18} color="#8B0000" />
                <Text style={styles.label}>Data do Exame <Text style={styles.required}> * </Text></Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#8B0000" />
                <Text style={styles.selectButtonText}>
                  {formatarDataExibicao(formData.data_exame)}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>

            {/* Médico Solicitante */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="doctor" size={18} color="#8B0000" />
                <Text style={styles.label}>Médico Solicitante <Text style={styles.required}>*</Text></Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowMedicoSelect(true)}
              >
                <Text style={[styles.selectButtonText, !formData.medico_solicitante && styles.placeholderText]}>
                  {formData.medico_solicitante || 'Selecione o médico'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>

            {/* Laboratório */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="test-tube" size={18} color="#8B0000" />
                <Text style={styles.label}>Laboratório <Text style={styles.required}>*</Text></Text>
              </View>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setShowLaboratorioSelect(true)}
              >
                <Text style={[styles.selectButtonText, !formData.laboratorio && styles.placeholderText]}>
                  {formData.laboratorio || 'Selecione o laboratório'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#8B0000" />
              </TouchableOpacity>
            </View>

            {/* Resultados */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="clipboard-text" size={18} color="#666" />
                <Text style={[styles.label, styles.labelOptional]}>Resultados</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Digite os resultados do exame..."
                placeholderTextColor="#999"
                value={formData.resultados}
                onChangeText={(text) => setFormData({ ...formData, resultados: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <MaterialCommunityIcons name="note-text" size={18} color="#666" />
                <Text style={[styles.label, styles.labelOptional]}>Observações</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observações adicionais..."
                placeholderTextColor="#999"
                value={formData.observacoes}
                onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Seção de PDF */}
            <View style={styles.pdfSection}>
              <View style={styles.pdfHeader}>
                <MaterialCommunityIcons name="file-pdf-box" size={22} color="#8B0000" />
                <Text style={styles.pdfSectionTitle}>Anexar PDF</Text>
                <View style={styles.pdfBadge}>
                  <Text style={styles.pdfBadgeText}>Opcional</Text>
                </View>
              </View>

              {!attachment ? (
                <TouchableOpacity style={styles.pdfButton} onPress={selecionarPDF}>
                  <MaterialCommunityIcons name="cloud-upload" size={40} color="#8B0000" />
                  <Text style={styles.pdfButtonText}>Selecionar PDF</Text>
                  <Text style={styles.pdfSubtext}>Clique para escolher um arquivo PDF</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pdfInfoContainer}>
                  <View style={styles.pdfInfo}>
                    <MaterialCommunityIcons name="file-pdf-box" size={36} color="#DC143C" />
                    <View style={styles.pdfDetails}>
                      <Text style={styles.pdfName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.pdfSize}>
                        {formatarTamanhoArquivo(attachment.size)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removePdfButton} onPress={removerPDF}>
                    <MaterialCommunityIcons name="delete" size={22} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {uploadingFile && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#8B0000" />
                <Text style={styles.uploadingText}>Enviando PDF...</Text>
              </View>
            )}

            {/* Botão Salvar */}
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={salvarExame}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={22} color="#FFF" />
                  <Text style={styles.saveButtonText}>CADASTRAR EXAME</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* MODAL GLOBAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={fecharModal}
        >
          <View style={styles.modalOverlayGlobal}>
            <View style={styles.modalContentGlobal}>
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
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalButtonPrincipal,
                    modalTipo === 'sucesso' && styles.modalButtonSuccess,
                    modalTipo === 'erro' && styles.modalButtonError,
                    modalTipo === 'info' && styles.modalButtonInfo,
                    modalTipo === 'confirmacao' && styles.modalButtonConfirm,
                  ]}
                  onPress={fecharModal}
                >
                  <Text style={styles.modalButtonText}>{modalBotaoTexto}</Text>
                </TouchableOpacity>

                {modalBotaoSecundario && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecundario]}
                    onPress={() => {
                      setModalVisible(false);
                      modalBotaoSecundario.acao();
                    }}
                  >
                    <Text style={[styles.modalButtonText, styles.modalButtonTextSecundario]}>
                      {modalBotaoSecundario.texto}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: TIPO DE EXAME */}
        <Modal visible={showTipoSelect} transparent animationType="slide">
          <TouchableOpacity 
            style={styles.selectModalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowTipoSelect(false)}
          >
            <View style={styles.selectModalContainer}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>Selecione o Tipo de Exame</Text>
                <TouchableOpacity onPress={() => setShowTipoSelect(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {TIPOS_EXAME.map((tipo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.selectOption}
                    onPress={() => {
                      setFormData({ ...formData, tipo_exame: tipo });
                      setShowTipoSelect(false);
                    }}
                  >
                    <Text style={styles.selectOptionText}>{tipo}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL: MÉDICO SOLICITANTE */}
        <Modal visible={showMedicoSelect} transparent animationType="slide">
          <TouchableOpacity 
            style={styles.selectModalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMedicoSelect(false)}
          >
            <View style={styles.selectModalContainer}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>Selecione o Médico</Text>
                <TouchableOpacity onPress={() => setShowMedicoSelect(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {MEDICOS.map((medico, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.selectOption}
                    onPress={() => {
                      setFormData({ ...formData, medico_solicitante: medico });
                      setShowMedicoSelect(false);
                    }}
                  >
                    <Text style={styles.selectOptionText}>{medico}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* MODAL: LABORATÓRIO */}
        <Modal visible={showLaboratorioSelect} transparent animationType="slide">
          <TouchableOpacity 
            style={styles.selectModalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowLaboratorioSelect(false)}
          >
            <View style={styles.selectModalContainer}>
              <View style={styles.selectModalHeader}>
                <Text style={styles.selectModalTitle}>Selecione o Laboratório</Text>
                <TouchableOpacity onPress={() => setShowLaboratorioSelect(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {LABORATORIOS.map((lab, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.selectOption}
                    onPress={() => {
                      setFormData({ ...formData, laboratorio: lab });
                      setShowLaboratorioSelect(false);
                    }}
                  >
                    <Text style={styles.selectOptionText}>{lab}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* CALENDÁRIO */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.data_exame}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, data_exame: selectedDate });
              }
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // HEADER COM COR SÓLIDA (SEM LOGO)
  header: {
    backgroundColor: '#8B0000', 
    paddingTop: 15,
    paddingBottom: 20, 
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  headerIconContainer: {
    width: 60, 
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, 
  },
  headerTitle: {
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  // FORMULÁRIO
  formCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  labelOptional: {
    color: '#666',
    fontWeight: '500',
  },
  required: {
    color: '#F44336',
    fontSize: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },

  // PDF SECTION
  pdfSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  pdfSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pdfBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pdfBadgeText: {
    fontSize: 11,
    color: '#E65100',
    fontWeight: '600',
  },
  pdfButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: '#8B0000',
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 10,
  },
  pdfSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  pdfInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfDetails: {
    marginLeft: 14,
    flex: 1,
  },
  pdfName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  pdfSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  removePdfButton: {
    padding: 8,
  },

  // UPLOADING
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadingText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '500',
  },

  // SAVE BUTTON
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#8B0000',
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#CC6666',
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // MODAL DE SELEÇÃO
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#333',
  },

  // MODAL GLOBAL
  modalOverlayGlobal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentGlobal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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