import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import IP from '../../service/api';

const API_URL = `http://${IP}:3000/api/exames`;

// Opções para selects
const TIPOS_EXAME = [
  'Hemograma',
  'Glicemia',
  'Colesterol',
  'Triglicerídeos',
  'Urina',
  'Raio-X',
  'Ultrassom',
  'Tomografia',
  'Ressonância',
  'Eletrocardiograma',
  'Teste de Esforço',
  'Endoscopia',
  'Colonoscopia',
  'Mamografia',
  'Papanicolau',
  'PCR',
  'COVID-19',
  'Outro',
];

const MEDICOS = [
  'Dr. João Silva - Clínico Geral',
  'Dra. Maria Santos - Cardiologista',
  'Dr. Pedro Oliveira - Ortopedista',
  'Dra. Ana Costa - Ginecologista',
  'Dr. Carlos Mendes - Neurologista',
  'Dra. Patricia Lima - Dermatologista',
  'Dr. Ricardo Alves - Pediatra',
  'Dra. Fernanda Rocha - Endocrinologista',
  'Dr. Eduardo Souza - Urologista',
  'Dra. Lucia Ferreira - Oftalmologista',
  'Outro',
];

const LABORATORIOS = [
  'Lab Diagnóstico Avançado',
  'Lab Medicina Laboratorial',
  'Lab Análises Clínicas',
  'Lab Alta Precisão',
  'Lab Central de Análises',
  'Lab Biotec Diagnósticos',
  'Lab Patologia Molecular',
  'Lab Saúde Total',
  'Lab Exame Rápido',
  'Outro',
];

interface AttachmentFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function CadastroExameScreen() {
  const [saving, setSaving] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    paciente_nome: '',
    tipo_exame: '',
    data_exame: new Date(),
    medico_solicitante: '',
    laboratorio: '',
    resultados: '',
    observacoes: '',
  });
  
  // Estados para selects e datepicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTipoSelect, setShowTipoSelect] = useState(false);
  const [showMedicoSelect, setShowMedicoSelect] = useState(false);
  const [showLaboratorioSelect, setShowLaboratorioSelect] = useState(false);
  const [tipoCustom, setTipoCustom] = useState(false);
  const [medicoCustom, setMedicoCustom] = useState(false);
  const [laboratorioCustom, setLaboratorioCustom] = useState(false);
  
  // Estado para PDF
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Funções auxiliares
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

  // Selecionar PDF
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
        Alert.alert('Sucesso', `PDF "${file.name}" selecionado!`);
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar PDF:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o PDF');
    }
  };

  const removerPDF = () => {
    setAttachment(null);
  };

  // Salvar exame
  const salvarExame = async () => {
    // Validações
    if (!formData.paciente_nome.trim()) {
      Alert.alert('Erro', 'Nome do paciente é obrigatório');
      return;
    }
    if (!formData.tipo_exame.trim()) {
      Alert.alert('Erro', 'Tipo de exame é obrigatório');
      return;
    }
    if (!formData.medico_solicitante.trim()) {
      Alert.alert('Erro', 'Médico solicitante é obrigatório');
      return;
    }
    if (!formData.laboratorio.trim()) {
      Alert.alert('Erro', 'Laboratório é obrigatório');
      return;
    }

    setSaving(true);
    setUploadingFile(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('paciente_nome', formData.paciente_nome.trim());
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

      console.log('📡 Enviando para:', API_URL);
      console.log('📦 Dados:', {
        paciente_nome: formData.paciente_nome,
        tipo_exame: formData.tipo_exame,
        data_exame: formatarDataAPI(formData.data_exame),
        medico_solicitante: formData.medico_solicitante,
        laboratorio: formData.laboratorio,
        tem_pdf: !!attachment
      });

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

      Alert.alert(
        'Sucesso!',
        attachment ? 'Exame cadastrado com PDF anexado!' : 'Exame cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpar formulário
              setFormData({
                paciente_nome: '',
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
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Erro:', error);
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar o exame');
    } finally {
      setSaving(false);
      setUploadingFile(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="file-plus" size={32} color="#8B0000" />
          <Text style={styles.headerTitle}>Cadastrar Exame</Text>
          <Text style={styles.headerSubtitle}>Preencha os dados do exame</Text>
        </View>

        {/* Formulário */}
        <View style={styles.formCard}>
          {/* Nome do Paciente */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialCommunityIcons name="account" size={16} color="#8B0000" /> 
              {' '}Nome do Paciente *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo do paciente"
              placeholderTextColor="#999"
              value={formData.paciente_nome}
              onChangeText={(text) => setFormData({ ...formData, paciente_nome: text })}
            />
          </View>

          {/* Tipo do Exame */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialCommunityIcons name="flask" size={16} color="#8B0000" /> 
              {' '}Tipo do Exame *
            </Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowTipoSelect(true)}
            >
              <Text style={styles.selectButtonText}>
                {formData.tipo_exame || 'Selecione o tipo de exame'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data do Exame */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialCommunityIcons name="calendar" size={16} color="#8B0000" /> 
              {' '}Data do Exame *
            </Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.selectButtonText}>
                {formatarDataExibicao(formData.data_exame)}
              </Text>
              <MaterialCommunityIcons name="calendar" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Médico Solicitante */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialCommunityIcons name="doctor" size={16} color="#8B0000" /> 
              {' '}Médico Solicitante *
            </Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowMedicoSelect(true)}
            >
              <Text style={styles.selectButtonText}>
                {formData.medico_solicitante || 'Selecione o médico'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Laboratório */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialCommunityIcons name="test-tube" size={16} color="#8B0000" /> 
              {' '}Laboratório *
            </Text>
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={() => setShowLaboratorioSelect(true)}
            >
              <Text style={styles.selectButtonText}>
                {formData.laboratorio || 'Selecione o laboratório'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Resultados */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <MaterialCommunityIcons name="clipboard-text" size={16} color="#666" /> 
              {' '}Resultados
            </Text>
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
            <Text style={styles.label}>
              <MaterialCommunityIcons name="note-text" size={16} color="#666" /> 
              {' '}Observações
            </Text>
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
            <Text style={styles.pdfSectionTitle}>
              <MaterialCommunityIcons name="file-pdf-box" size={18} color="#8B0000" /> 
              {' '}Anexar PDF (Opcional)
            </Text>

            {!attachment ? (
              <TouchableOpacity style={styles.pdfButton} onPress={selecionarPDF}>
                <MaterialCommunityIcons name="cloud-upload" size={24} color="#8B0000" />
                <Text style={styles.pdfButtonText}>Selecionar PDF</Text>
                <Text style={styles.pdfSubtext}>Clique para escolher um arquivo PDF</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pdfInfoContainer}>
                <View style={styles.pdfInfo}>
                  <MaterialCommunityIcons name="file-pdf-box" size={32} color="#DC143C" />
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
                  <MaterialCommunityIcons name="delete" size={20} color="#FF4444" />
                  <Text style={styles.removePdfText}>Remover</Text>
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
                <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>CADASTRAR EXAME</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de seleção - Tipo de Exame */}
      <Modal
        visible={showTipoSelect}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTipoSelect(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
            <View style={styles.selectModalHeader}>
              <Text style={styles.selectModalTitle}>Selecione o Tipo de Exame</Text>
              <TouchableOpacity onPress={() => setShowTipoSelect(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {TIPOS_EXAME.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.selectOption}
                  onPress={() => {
                    setFormData({ ...formData, tipo_exame: item });
                    setTipoCustom(false);
                    setShowTipoSelect(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item}</Text>
                  {formData.tipo_exame === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#8B0000" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.selectOption, styles.customOption]}
                onPress={() => {
                  setTipoCustom(true);
                  setFormData({ ...formData, tipo_exame: '' });
                  setShowTipoSelect(false);
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#8B0000" />
                <Text style={[styles.selectOptionText, styles.customOptionText]}>
                  Digitar outro...
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção - Médico */}
      <Modal
        visible={showMedicoSelect}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMedicoSelect(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
            <View style={styles.selectModalHeader}>
              <Text style={styles.selectModalTitle}>Selecione o Médico</Text>
              <TouchableOpacity onPress={() => setShowMedicoSelect(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {MEDICOS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.selectOption}
                  onPress={() => {
                    setFormData({ ...formData, medico_solicitante: item });
                    setMedicoCustom(false);
                    setShowMedicoSelect(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item}</Text>
                  {formData.medico_solicitante === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#8B0000" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.selectOption, styles.customOption]}
                onPress={() => {
                  setMedicoCustom(true);
                  setFormData({ ...formData, medico_solicitante: '' });
                  setShowMedicoSelect(false);
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#8B0000" />
                <Text style={[styles.selectOptionText, styles.customOptionText]}>
                  Digitar outro...
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de seleção - Laboratório */}
      <Modal
        visible={showLaboratorioSelect}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLaboratorioSelect(false)}
      >
        <View style={styles.selectModalOverlay}>
          <View style={styles.selectModalContainer}>
            <View style={styles.selectModalHeader}>
              <Text style={styles.selectModalTitle}>Selecione o Laboratório</Text>
              <TouchableOpacity onPress={() => setShowLaboratorioSelect(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {LABORATORIOS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.selectOption}
                  onPress={() => {
                    setFormData({ ...formData, laboratorio: item });
                    setLaboratorioCustom(false);
                    setShowLaboratorioSelect(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{item}</Text>
                  {formData.laboratorio === item && (
                    <MaterialCommunityIcons name="check" size={20} color="#8B0000" />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.selectOption, styles.customOption]}
                onPress={() => {
                  setLaboratorioCustom(true);
                  setFormData({ ...formData, laboratorio: '' });
                  setShowLaboratorioSelect(false);
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#8B0000" />
                <Text style={[styles.selectOptionText, styles.customOptionText]}>
                  Digitar outro...
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.data_exame}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, data_exame: selectedDate });
            }
          }}
        />
      )}

      {/* Input customizado para Tipo */}
      {tipoCustom && (
        <Modal transparent={true} animationType="slide" visible={tipoCustom}>
          <View style={styles.customInputOverlay}>
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputTitle}>Digite o Tipo de Exame</Text>
              <TextInput
                style={styles.customInput}
                autoFocus
                value={formData.tipo_exame}
                onChangeText={(text) => setFormData({ ...formData, tipo_exame: text })}
                placeholder="Ex: Biópsia, Cintilografia..."
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity 
                  style={styles.customInputCancel}
                  onPress={() => {
                    setTipoCustom(false);
                    if (!formData.tipo_exame) {
                      setFormData({ ...formData, tipo_exame: '' });
                    }
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.customInputConfirm}
                  onPress={() => setTipoCustom(false)}
                >
                  <Text style={{ color: '#8B0000', fontWeight: 'bold' }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Input customizado para Médico */}
      {medicoCustom && (
        <Modal transparent={true} animationType="slide" visible={medicoCustom}>
          <View style={styles.customInputOverlay}>
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputTitle}>Digite o nome do Médico</Text>
              <TextInput
                style={styles.customInput}
                autoFocus
                value={formData.medico_solicitante}
                onChangeText={(text) => setFormData({ ...formData, medico_solicitante: text })}
                placeholder="Dr(a). Nome Completo"
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity 
                  style={styles.customInputCancel}
                  onPress={() => {
                    setMedicoCustom(false);
                    if (!formData.medico_solicitante) {
                      setFormData({ ...formData, medico_solicitante: '' });
                    }
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.customInputConfirm}
                  onPress={() => setMedicoCustom(false)}
                >
                  <Text style={{ color: '#8B0000', fontWeight: 'bold' }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Input customizado para Laboratório */}
      {laboratorioCustom && (
        <Modal transparent={true} animationType="slide" visible={laboratorioCustom}>
          <View style={styles.customInputOverlay}>
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputTitle}>Digite o nome do Laboratório</Text>
              <TextInput
                style={styles.customInput}
                autoFocus
                value={formData.laboratorio}
                onChangeText={(text) => setFormData({ ...formData, laboratorio: text })}
                placeholder="Nome do laboratório"
              />
              <View style={styles.customInputButtons}>
                <TouchableOpacity 
                  style={styles.customInputCancel}
                  onPress={() => {
                    setLaboratorioCustom(false);
                    if (!formData.laboratorio) {
                      setFormData({ ...formData, laboratorio: '' });
                    }
                  }}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.customInputConfirm}
                  onPress={() => setLaboratorioCustom(false)}
                >
                  <Text style={{ color: '#8B0000', fontWeight: 'bold' }}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pdfSection: {
    marginTop: 10,
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pdfSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  pdfButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#8B0000',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 8,
  },
  pdfSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  pdfInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pdfInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfDetails: {
    marginLeft: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  removePdfText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadingText: {
    fontSize: 14,
    color: '#8B0000',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B0000',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#CC6666',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  selectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  customOption: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    backgroundColor: '#FFF5F5',
  },
  customOptionText: {
    color: '#8B0000',
    fontWeight: '500',
  },
  customInputOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  customInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  customInputButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  customInputCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  customInputConfirm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});